import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { format } from "date-fns";
import { Search } from "lucide-react";

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
  number_of_tickets: number;
  bhaktha_details: any;
  temples: {
    name: string;
  };
}

const DarshanBookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templeFilter, setTempleFilter] = useState("all");
  const [temples, setTemples] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, templeFilter]);

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
      
      const uniqueTemples = [...new Set(data.bookings?.map((b: Booking) => b.temples?.name).filter(Boolean))] as string[];
      setTemples(uniqueTemples);
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

  const filterBookings = () => {
    let filtered = [...bookings];
    
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    if (templeFilter !== "all") {
      filtered = filtered.filter(booking => booking.temples?.name === templeFilter);
    }
    
    setFilteredBookings(filtered);
  };

  const updateStatus = async (bookingId: string, newStatus: "awaiting" | "confirmed" | "cancelled" | "refunded") => {
    try {
      const { error } = await supabase
        .from("darshan_bookings")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", bookingId);

      if (error) throw error;

      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );

      let statusMessage = "Booking status updated";
      if (newStatus === "confirmed") {
        statusMessage = "✅ Booking confirmed! Customer will be notified.";
      } else if (newStatus === "cancelled") {
        statusMessage = "❌ Booking cancelled. Consider refunding payment if made.";
      } else if (newStatus === "refunded") {
        statusMessage = "💰 Booking refunded. Please process refund separately.";
      }

      toast({
        title: "Status Updated",
        description: statusMessage,
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
      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Admin Verification Required</h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          All bookings require manual verification before confirmation:
        </p>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside mt-2 space-y-1">
          <li>Verify customer details and contact information</li>
          <li>Confirm payment received (check UPI transaction)</li>
          <li>Review bhaktha details for accuracy</li>
          <li>Only mark as "Confirmed" after all verification is complete</li>
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Darshan Bookings</h2>
        <Button onClick={fetchBookings} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name, email or invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="awaiting">Awaiting</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={templeFilter} onValueChange={setTempleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Temple" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Temples</SelectItem>
            {temples.map(temple => (
              <SelectItem key={temple} value={temple}>{temple}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Temple</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Tickets</TableHead>
              <TableHead>Darshan Type</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-mono text-xs">
                  {booking.invoice_number}
                </TableCell>
                <TableCell>{booking.temples?.name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{booking.customer_email}</p>
                    <p className="text-xs text-muted-foreground">{booking.customer_phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{booking.number_of_tickets || 1}</Badge>
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

      {filteredBookings.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No bookings found
        </div>
      )}
    </div>
  );
};

export default DarshanBookingManagement;