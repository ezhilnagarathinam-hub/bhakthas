import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, ShoppingBag, MapPin, Star, Award, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bhakthiScore, setBhakthiScore] = useState(0);
  const [creditPoints, setCreditPoints] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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
    fetchUserData(session.user.id);
  };

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, products(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);

      // Fetch darshan bookings
      const { data: bookingsData } = await supabase
        .from('darshan_bookings')
        .select('*, temples(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setBookings(bookingsData || []);

      // Fetch bhakthi score (verified temple visits)
      const { data: visitsData } = await supabase
        .from('temple_visits')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('verified', true);

      const totalPoints = visitsData?.reduce((sum, visit) => sum + (visit.points_earned || 0), 0) || 0;
      setBhakthiScore(totalPoints);

      // Calculate credit points (1000 points = 25% discount)
      const credits = Math.floor(totalPoints / 1000);
      setCreditPoints(credits);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-sacred bg-clip-text text-transparent mb-2">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email?.split('@')[0]}!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-sacred text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Bhakthi Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bhakthiScore}</div>
              <p className="text-xs text-white/80 mt-1">
                Total points earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                Credit Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{creditPoints}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Available credits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                Discount Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{getDiscountPercentage()}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                On next purchase
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-secondary" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">
                {bhakthiScore % 1000}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                / 1000 to next reward
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress to Next Reward */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Progress to Next Reward
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Current: {bhakthiScore % 1000} points</span>
                <span>Next Reward: 1000 points</span>
              </div>
              <Progress value={getProgressToNextReward()} className="h-3" />
            </div>
            <p className="text-sm text-muted-foreground">
              🎯 Earn {1000 - (bhakthiScore % 1000)} more points to unlock 25% discount!
            </p>
          </CardContent>
        </Card>

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
    </div>
  );
};

export default UserDashboard;
