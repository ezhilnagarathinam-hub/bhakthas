import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Package, MapPin, BookOpen, Users, ShoppingBag, BarChart, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ProductManagement from "@/components/admin/ProductManagement";
import TempleManagement from "@/components/admin/TempleManagement";
import MantraManagement from "@/components/admin/MantraManagement";
import OrderManagement from "@/components/admin/OrderManagement";
import UserManagement from "@/components/admin/UserManagement";
import UsageReports from "@/components/admin/UsageReports";
import Analytics from "@/components/admin/Analytics";
import DarshanBookingManagement from "@/components/admin/DarshanBookingManagement";
import ContributionManagement from "@/components/admin/ContributionManagement";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      toast({
        title: "Access Error",
        description: "Failed to verify admin access",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-admin font-poppins">
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-yellow-700 border-b-2 border-yellow-500/50 shadow-glow animate-divine-shine" style={{ backgroundSize: '200% 200%' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="animate-glow-pulse">
              <Shield className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white font-cinzel drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                Admin Dashboard
              </h1>
              <p className="text-yellow-200 text-lg">Manage your spiritual platform with divine grace</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 bg-gradient-to-r from-red-950 to-yellow-950 border-2 border-yellow-600/30 p-2 shadow-divine">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="temples" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Temples</span>
            </TabsTrigger>
            <TabsTrigger value="mantras" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Mantras</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="darshan" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Darshan</span>
            </TabsTrigger>
            <TabsTrigger value="contributions" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Contributions</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <UsageReports />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="temples">
            <TempleManagement />
          </TabsContent>

          <TabsContent value="mantras">
            <MantraManagement />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="darshan">
            <DarshanBookingManagement />
          </TabsContent>

          <TabsContent value="contributions">
            <ContributionManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
