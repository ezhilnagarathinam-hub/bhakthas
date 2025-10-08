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
    setLoading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Payment Successful!",
      description: "Your darshan booking payment has been processed",
    });

    navigate(`/darshan/ticket/${bookingId}`);
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
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Cash on Arrival</h4>
                    <p className="text-sm text-muted-foreground">
                      Pay when you arrive at the temple
                    </p>
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
              {loading ? "Processing..." : "Confirm Booking"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DarshanPayment;
