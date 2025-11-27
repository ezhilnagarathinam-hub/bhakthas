import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Booking {
  id: string;
  temple_id: string;
  darshan_type: string;
  amount_paid: number;
  darshan_date: string;
  darshan_time: string;
  customer_name: string;
  invoice_number: string;
  number_of_tickets: number;
  temples: {
    name: string;
  };
}

const DarshanPayment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from("darshan_bookings")
        .select(`
          *,
          temples (name)
        `)
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast({
        title: "Error",
        description: "Failed to load booking details",
        variant: "destructive",
      });
      navigate("/darshan");
    }
  };

  const handlePayment = async () => {
    if (!booking) return;
    
    setLoading(true);
    
    try {
      // Generate UPI payment link
      const upiId = "temple@upi"; // Replace with actual temple UPI ID
      const amount = booking.amount_paid;
      const upiLink = `upi://pay?pa=${upiId}&pn=Temple Darshan&am=${amount}&cu=INR&tn=Darshan ${booking.invoice_number}`;
      
      // Try to open UPI payment
      const paymentWindow = window.open(upiLink, '_blank');
      
      // If popup blocked or UPI not supported, show instructions
      if (!paymentWindow) {
        toast({
          title: "Payment Information",
          description: `Please pay ₹${amount} to UPI ID: ${upiId} with reference: ${booking.invoice_number}`,
          duration: 10000,
        });
      } else {
        toast({
          title: "Payment Initiated",
          description: "Complete payment in your UPI app",
        });
      }

      // Wait for user to complete payment (in production, use webhook/callback)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update booking status to confirmed after payment
      const { error } = await supabase
        .from("darshan_bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Payment Successful!",
        description: "Your darshan booking is confirmed",
      });

      navigate(`/darshan/ticket/${bookingId}`);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const getDarshanLabel = (type: string) => {
    const labels: Record<string, string> = {
      standard_100: "Standard Darshan",
      standard_500: "Premium Darshan",
      vip_1000: "Special VIP Darshan",
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-sacred/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-sacred bg-clip-text text-transparent">
            Payment
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">Complete your booking payment</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temple</span>
                <span className="font-semibold">{booking.temples.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Darshan Type</span>
                <span className="font-semibold">{getDarshanLabel(booking.darshan_type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-semibold">{format(new Date(booking.darshan_date), "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-semibold">{booking.darshan_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of Tickets</span>
                <span className="font-semibold">{booking.number_of_tickets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-semibold">{booking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Number</span>
                <span className="font-semibold">{booking.invoice_number}</span>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-xl">
                <span className="font-bold">Total Amount</span>
                <span className="font-bold text-primary">₹{booking.amount_paid}</span>
              </div>
            </div>

            <Card className="bg-muted/30 mt-6">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Payment Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-primary/20">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xl">📱</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">UPI Payment</p>
                      <p className="text-xs text-muted-foreground">Pay via Google Pay, PhonePe, Paytm</p>
                    </div>
                  </div>
                  <div className="text-center text-sm text-muted-foreground p-2">
                    You'll be redirected to your UPI app to complete payment
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handlePayment}
              variant="sacred"
              size="lg"
              className="w-full mt-6"
              disabled={loading}
            >
              {loading ? "Opening UPI App..." : "Pay with UPI"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DarshanPayment;
