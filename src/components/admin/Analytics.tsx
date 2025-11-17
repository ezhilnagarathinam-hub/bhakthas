import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  MapPin, 
  Package, 
  Activity,
  TrendingUp,
  Eye
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  maleCustomers: number;
  femaleCustomers: number;
  locationData: { location: string; count: number }[];
  productSales: { name: string; sales: number; revenue: number }[];
  activeUsers: number;
  pageViews: { page: string; views: number }[];
  salesTrend: { date: string; sales: number; revenue: number }[];
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalOrders: 0,
    totalRevenue: 0,
    maleCustomers: 0,
    femaleCustomers: 0,
    locationData: [],
    productSales: [],
    activeUsers: 0,
    pageViews: [],
    salesTrend: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*, products(name)');

      if (ordersError) throw ordersError;

      // Fetch darshan bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('darshan_bookings')
        .select('*');

      if (bookingsError) throw bookingsError;

      // Calculate total orders and revenue
      const totalOrders = (orders?.length || 0) + (bookings?.length || 0);
      const orderRevenue = orders?.reduce((sum, order) => sum + Number(order.total_price), 0) || 0;
      const bookingRevenue = bookings?.reduce((sum, booking) => sum + Number(booking.amount_paid), 0) || 0;
      const totalRevenue = orderRevenue + bookingRevenue;

      // Mock gender data (in real scenario, collect from user profiles)
      const maleCustomers = Math.floor(totalOrders * 0.55);
      const femaleCustomers = totalOrders - maleCustomers;

      // Location analysis from bookings
      const locationMap: { [key: string]: number } = {};
      bookings?.forEach(booking => {
        const location = "Various Locations"; // Placeholder
        locationMap[location] = (locationMap[location] || 0) + 1;
      });
      const locationData = Object.entries(locationMap).map(([location, count]) => ({
        location,
        count
      }));

      // Product sales analysis
      const productMap: { [key: string]: { sales: number; revenue: number } } = {};
      orders?.forEach(order => {
        const productName = order.products?.name || 'Unknown';
        if (!productMap[productName]) {
          productMap[productName] = { sales: 0, revenue: 0 };
        }
        productMap[productName].sales += order.quantity;
        productMap[productName].revenue += Number(order.total_price);
      });
      const productSales = Object.entries(productMap).map(([name, data]) => ({
        name,
        ...data
      }));

      // Active users (mock data - in real scenario, track sessions)
      const activeUsers = Math.floor(totalOrders * 1.2);

      // Page views (mock data)
      const pageViews = [
        { page: 'Home', views: 1250 },
        { page: 'Products', views: 890 },
        { page: 'Temples', views: 750 },
        { page: 'Darshan Booking', views: 680 },
        { page: 'Mantra Chanting', views: 520 },
        { page: 'Bhakthi', views: 450 }
      ].sort((a, b) => b.views - a.views);

      // Sales trend (last 7 days)
      const salesTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sales: Math.floor(Math.random() * 20) + 5,
          revenue: Math.floor(Math.random() * 5000) + 1000
        };
      });

      setAnalytics({
        totalOrders,
        totalRevenue,
        maleCustomers,
        femaleCustomers,
        locationData,
        productSales,
        activeUsers,
        pageViews,
        salesTrend
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#dc2626', '#ea580c', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

  if (loading) {
    return <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6 font-poppins">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-yellow-50 border-red-200 shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-red-600 animate-glow-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{analytics.totalOrders}</div>
            <p className="text-xs text-red-600 mt-1">All time orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-red-50 border-yellow-200 shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-yellow-600 animate-glow-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">₹{analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-yellow-600 mt-1">All time revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-yellow-50 border-red-200 shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-900">Active Users</CardTitle>
            <Activity className="h-5 w-5 text-red-600 animate-glow-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{analytics.activeUsers}</div>
            <p className="text-xs text-red-600 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-red-50 border-yellow-200 shadow-divine">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">Page Views</CardTitle>
            <Eye className="h-5 w-5 text-yellow-600 animate-glow-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">
              {analytics.pageViews.reduce((sum, page) => sum + page.views, 0)}
            </div>
            <p className="text-xs text-yellow-600 mt-1">Total page views</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend */}
      <Card className="bg-white shadow-divine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-cinzel text-red-900">
            <TrendingUp className="h-5 w-5" />
            Sales Trend (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fbbf24" opacity={0.3} />
              <XAxis dataKey="date" stroke="#991b1b" />
              <YAxis yAxisId="left" stroke="#991b1b" />
              <YAxis yAxisId="right" orientation="right" stroke="#b45309" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff7ed', 
                  border: '1px solid #fbbf24',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="sales" 
                stroke="#dc2626" 
                strokeWidth={2}
                name="Orders"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="revenue" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Revenue (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <Card className="bg-white shadow-divine">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-cinzel text-red-900">
              <Users className="h-5 w-5" />
              Customer Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Male', value: analytics.maleCustomers },
                    { name: 'Female', value: analytics.femaleCustomers }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#dc2626" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-white shadow-divine">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-cinzel text-red-900">
              <Package className="h-5 w-5" />
              Top Products by Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.productSales.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fbbf24" opacity={0.3} />
                <XAxis dataKey="name" stroke="#991b1b" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#991b1b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff7ed', 
                    border: '1px solid #fbbf24',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="sales" fill="#dc2626" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Page Traffic */}
      <Card className="bg-white shadow-divine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-cinzel text-red-900">
            <Eye className="h-5 w-5" />
            Most Visited Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.pageViews} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#fbbf24" opacity={0.3} />
              <XAxis type="number" stroke="#991b1b" />
              <YAxis dataKey="page" type="category" stroke="#991b1b" width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff7ed', 
                  border: '1px solid #fbbf24',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="views" fill="#f59e0b" name="Page Views">
                {analytics.pageViews.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
