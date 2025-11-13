import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Booking {
  id: string;
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
  };
}

const DarshanBookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('admin-list-bookings', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      setBookings(data.bookings || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: string, newStatus: "awaiting" | "confirmed" | "cancelled" | "refunded") => {
    try {
      const { error } = await supabase
        .from("darshan_bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );

      toast({
        title: "Status updated",
        description: `Booking status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const getDarshanLabel = (type: string) => {
    const labels: Record<string, string> = {
      standard_100: "Standard ₹100",
      standard_500: "Premium ₹500",
      vip_1000: "VIP ₹1000",
      free: "Free",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      awaiting: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
      refunded: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  if (loading) {
    return <div>Loading bookings...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Darshan Bookings</h2>
        <Button onClick={fetchBookings} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Temple</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Darshan Type</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-mono text-xs">
                  {booking.invoice_number}
                </TableCell>
                <TableCell>{booking.temples.name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{booking.customer_email}</p>
                    <p className="text-xs text-muted-foreground">{booking.customer_phone}</p>
                  </div>
                </TableCell>
                <TableCell>{getDarshanLabel(booking.darshan_type)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p>{format(new Date(booking.darshan_date), "PPP")}</p>
                    <p className="text-sm text-muted-foreground">{booking.darshan_time}</p>
                  </div>
                </TableCell>
                <TableCell className="font-semibold">₹{booking.amount_paid}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell>
                  <Select
                    value={booking.status}
                    onValueChange={(value) => updateStatus(booking.id, value as "awaiting" | "confirmed" | "cancelled" | "refunded")}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awaiting">Awaiting</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No bookings found
        </div>
      )}
    </div>
  );
};

export default DarshanBookingManagement;
