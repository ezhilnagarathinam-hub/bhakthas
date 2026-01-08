import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Trophy, ShoppingBag, MapPin, Star, Award, Gift, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bhakthiScore, setBhakthiScore] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your dashboard",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      setUser(session.user);
      await fetchUserData(session.user.id);
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch all data in parallel
      const [ordersRes, bookingsRes, pointsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('*, products(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('darshan_bookings')
          .select('*, temples(name)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_bhakthi_points')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      setOrders(ordersRes.data || []);
      setBookings(bookingsRes.data || []);

      if (pointsRes.data) {
        setBhakthiScore(pointsRes.data.total_points || 0);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDiscountPercentage = () => {
    return Math.min(Math.floor((bhakthiScore / 1000) * 25), 25);
  };

  const getProgressToNextReward = () => {
    return (bhakthiScore % 1000) / 10;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500';
      case 'awaiting':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'refunded':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-sacred bg-clip-text text-transparent mb-2">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email?.split('@')[0]}!
          </p>
        </div>
        <Button 
          onClick={() => navigate('/contribute')}
          className="bg-gradient-sacred hover:opacity-90"
        >
          <Upload className="w-4 h-4 mr-2" />
          Contribute Temple
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-sacred border-2 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MapPin className="w-5 h-5" />
              Temples Visited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">{bookings.filter(b => b.status === 'confirmed').length}</p>
            <p className="text-sm text-yellow-200 mt-2">Verified Visits</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-mystic border-2 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ShoppingBag className="w-5 h-5" />
              Products Purchased
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">{orders.length}</p>
            <p className="text-sm text-blue-200 mt-2">Total Orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-peaceful border-2 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5" />
              Bhakthi Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">{bhakthiScore}</p>
            <p className="text-sm text-green-200 mt-2">Total Points</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Gift className="w-5 h-5" />
              Available Discount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">{getDiscountPercentage()}%</p>
            <p className="text-sm text-purple-200 mt-2">Current Discount</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Discounts Availed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order, index) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm">Order #{index + 1}</span>
                  <Badge variant="secondary">{getDiscountPercentage()}% discount</Badge>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-sm text-muted-foreground">No discounts used yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Remaining Points & Discount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Points to Next Level</p>
                <Progress value={getProgressToNextReward()} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  {1000 - (bhakthiScore % 1000)} points needed for next 25% discount
                </p>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Points:</span>
                  <span className="text-lg font-bold text-primary">{bhakthiScore}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium">Equivalent Discount:</span>
                  <span className="text-lg font-bold text-green-600">{getDiscountPercentage()}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookings">
            <MapPin className="h-4 w-4 mr-2" />
            Darshan Bookings
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Product Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          {bookings.length === 0 ? (
            <Card className="p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No darshan bookings yet</p>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">
                        {booking.temples?.name || 'Unknown Temple'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Invoice: {booking.invoice_number}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{new Date(booking.darshan_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">{booking.darshan_time}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{booking.darshan_type?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount Paid</p>
                      <p className="font-medium">₹{booking.amount_paid}</p>
                    </div>
                  </div>
                  {booking.status === 'awaiting' && new Date(booking.darshan_date) < new Date() && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-4">
                      ⚠️ Note: Your booking is still awaiting confirmation past the darshan date. Payment will be refunded if not confirmed.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <Card className="p-8 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No product orders yet</p>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">
                        {order.products?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Order ID: {order.id.slice(0, 8)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium">{order.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Price</p>
                      <p className="font-medium">₹{order.total_price}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Order Date</p>
                      <p className="font-medium">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{order.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
