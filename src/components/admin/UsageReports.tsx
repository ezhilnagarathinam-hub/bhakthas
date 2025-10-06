import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Users, MapPin, ShoppingCart, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UsageReports = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTemples: 0,
    totalVisits: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { users } } = await supabase.auth.admin.listUsers();
      
      const { count: templesCount } = await supabase
        .from('temples')
        .select('*', { count: 'exact', head: true });

      const { count: visitsCount } = await supabase
        .from('temple_visits')
        .select('*', { count: 'exact', head: true });

      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { data: orders } = await supabase
        .from('orders')
        .select('total_price');

      const revenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_price.toString()), 0) || 0;

      setStats({
        totalUsers: users?.length || 0,
        totalTemples: templesCount || 0,
        totalVisits: visitsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue: revenue
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Temples",
      value: stats.totalTemples,
      icon: MapPin,
      color: "text-purple-600"
    },
    {
      title: "Temple Visits",
      value: stats.totalVisits,
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-orange-600"
    },
    {
      title: "Revenue",
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: BarChart,
      color: "text-pink-600"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Usage Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UsageReports;
