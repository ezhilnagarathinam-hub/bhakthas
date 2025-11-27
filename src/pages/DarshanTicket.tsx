import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface Booking {
  id: string;
  temple_id: string;
  darshan_type: string;
  amount_paid: number;
  darshan_date: string;
  darshan_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  invoice_number: string;
  status: string;
  created_at: string;
  temples: {
    name: string;
    address: string;
  };
}

const DarshanTicket = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
      
      // Subscribe to realtime updates for booking status
      const channel = supabase
        .channel('booking-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'darshan_bookings',
            filter: `id=eq.${bookingId}`,
          },
          (payload) => {
            setBooking(prev => prev ? { ...prev, status: payload.new.status } : null);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data, error } = await supabase
        .from("darshan_bookings")
        .select(`
          *,
          temples (name, address)
        `)
        .eq("id", bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast({
        title: "Error",
        description: "Failed to load ticket details",
        variant: "destructive",
      });
      navigate("/darshan");
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading ticket...</p>
      </div>
    );
  }

  const getDarshanLabel = (type: string) => {
    const labels: Record<string, string> = {
      standard_100: "Standard Darshan",
      standard_500: "Premium Darshan",
      vip_1000: "Special VIP Darshan",
      free: "Free Darshan",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-4 w-4 mr-1" />
            Confirmed
          </Badge>
        );
      case "awaiting":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="h-4 w-4 mr-1" />
            Awaiting Confirmation
          </Badge>
        );
      case "cancelled":
      case "refunded":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="h-4 w-4 mr-1" />
            {status === "refunded" ? "Refunded" : "Cancelled"}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const isPastDarshan = new Date(booking.darshan_date) < new Date();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-sacred/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-sacred bg-clip-text text-transparent">
            Darshan Ticket
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">Your booking confirmation</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden">
          <div className="bg-gradient-sacred/10 p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{booking.temples.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{booking.temples.address}</p>
              </div>
              {getStatusBadge(booking.status)}
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="font-semibold">{booking.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Darshan Type</p>
                <p className="font-semibold">{getDarshanLabel(booking.darshan_type)}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">{format(new Date(booking.darshan_date), "PPP")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-semibold">{booking.darshan_time}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Customer Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{booking.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{booking.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{booking.customer_phone}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl">
                <span className="font-bold">Amount Paid</span>
                <span className="font-bold text-primary">₹{booking.amount_paid}</span>
              </div>
            </div>

            {booking.status === "awaiting" && isPastDarshan && (
              <Card className="bg-yellow-500/10 border-yellow-500/20">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    ⚠️ Important Notice: Your booking is still awaiting confirmation and the darshan date has passed. 
                    Your payment will be refunded if the booking is not confirmed soon.
                  </p>
                </CardContent>
              </Card>
            )}

            {booking.status === "awaiting" && (
              <Card className="bg-yellow-500/10 border-yellow-500/20">
                <CardContent className="p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⏳ Your booking is awaiting admin verification. You will be notified once the admin confirms your booking and payment.
                  </p>
                </CardContent>
              </Card>
            )}

            {booking.status === "confirmed" && (
              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    ✓ Your darshan booking has been confirmed! Please arrive 15 minutes before your scheduled time.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/darshan")}
                variant="outline"
                className="flex-1"
              >
                Book Another Darshan
              </Button>
              <Button
                onClick={() => window.print()}
                variant="sacred"
                className="flex-1"
              >
                Print Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DarshanTicket;
