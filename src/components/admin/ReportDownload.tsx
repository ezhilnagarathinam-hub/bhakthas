import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

const ReportDownload = () => {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing Dates",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let reportData: any = {};

      // Fetch orders
      if (reportType === "all" || reportType === "orders") {
        const { data: orders } = await supabase
          .from('orders')
          .select('*, products(name, category)')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59');
        reportData.orders = orders || [];
      }

      // Fetch bookings
      if (reportType === "all" || reportType === "bookings") {
        const { data: bookings } = await supabase
          .from('darshan_bookings')
          .select('*, temples(name)')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59');
        reportData.bookings = bookings || [];
      }

      // Fetch temple visits
      if (reportType === "all" || reportType === "visits") {
        const { data: visits } = await supabase
          .from('temple_visits')
          .select('*, temples(name)')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59');
        reportData.visits = visits || [];
      }

      // Fetch contributions
      if (reportType === "all" || reportType === "contributions") {
        const { data: contributions } = await supabase
          .from('temple_contributions')
          .select('*')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59');
        reportData.contributions = contributions || [];
      }

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Add sheets based on data
      if (reportData.orders) {
        const ordersSheet = XLSX.utils.json_to_sheet(
          reportData.orders.map((o: any) => ({
            'Order ID': o.id,
            'Product': o.products?.name || 'N/A',
            'Category': o.products?.category || 'N/A',
            'Quantity': o.quantity,
            'Total Price': o.total_price,
            'Status': o.status,
            'Created At': new Date(o.created_at).toLocaleString(),
          }))
        );
        XLSX.utils.book_append_sheet(wb, ordersSheet, "Orders");
      }

      if (reportData.bookings) {
        const bookingsSheet = XLSX.utils.json_to_sheet(
          reportData.bookings.map((b: any) => ({
            'Booking ID': b.invoice_number,
            'Temple': b.temples?.name || 'N/A',
            'Customer Name': b.customer_name,
            'Customer Email': b.customer_email,
            'Darshan Type': b.darshan_type,
            'Date': b.darshan_date,
            'Time': b.darshan_time,
            'Tickets': b.number_of_tickets,
            'Amount': b.amount_paid,
            'Status': b.status,
            'Created At': new Date(b.created_at).toLocaleString(),
          }))
        );
        XLSX.utils.book_append_sheet(wb, bookingsSheet, "Bookings");
      }

      if (reportData.visits) {
        const visitsSheet = XLSX.utils.json_to_sheet(
          reportData.visits.map((v: any) => ({
            'Temple': v.temples?.name || 'N/A',
            'Points Earned': v.points_earned,
            'Verified': v.verified ? 'Yes' : 'No',
            'Visit Date': new Date(v.visit_date).toLocaleString(),
          }))
        );
        XLSX.utils.book_append_sheet(wb, visitsSheet, "Temple Visits");
      }

      if (reportData.contributions) {
        const contributionsSheet = XLSX.utils.json_to_sheet(
          reportData.contributions.map((c: any) => ({
            'Temple Name': c.temple_name,
            'City': c.city,
            'State': c.state,
            'Status': c.status,
            'Created At': new Date(c.created_at).toLocaleString(),
          }))
        );
        XLSX.utils.book_append_sheet(wb, contributionsSheet, "Contributions");
      }

      // Generate filename
      const filename = `temple-report-${startDate}-to-${endDate}.xlsx`;
      
      // Write file
      XLSX.writeFile(wb, filename);

      toast({
        title: "Report Generated",
        description: `Report downloaded successfully as ${filename}`,
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Download Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Custom Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="orders">Orders Only</SelectItem>
                <SelectItem value="bookings">Bookings Only</SelectItem>
                <SelectItem value="visits">Temple Visits Only</SelectItem>
                <SelectItem value="contributions">Contributions Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Button 
            onClick={generateReport} 
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? (
              "Generating..."
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDownload;
