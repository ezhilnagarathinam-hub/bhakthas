import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import TempleMap from "@/components/TempleMap";
import { 
  MapPin, 
  Navigation, 
  Star, 
  Target, 
  Trophy, 
  Gift,
  Map,
  Compass
} from "lucide-react";

interface Temple {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  state: string | null;
  rating: number;
  points: number;
}

const Bhakthi = () => {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [userScore, setUserScore] = useState(0);
  const [templesVisited, setTemplesVisited] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [currentDiscount, setCurrentDiscount] = useState(0);
  const [totalTemples, setTotalTemples] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyTemples, setNearbyTemples] = useState<(Temple & { distance: number })[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    fetchTemples();
    getUserLocation();
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          toast({
            title: "Location Access",
            description: "Please enable location access to see nearby temples",
            variant: "destructive",
          });
        }
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  useEffect(() => {
    if (userLocation && temples.length > 0) {
      const templesWithDistance = temples.map(temple => ({
        ...temple,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          temple.latitude,
          temple.longitude
        )
      }));
      
      // Sort by distance
      templesWithDistance.sort((a, b) => a.distance - b.distance);
      setNearbyTemples(templesWithDistance);
    }
  }, [userLocation, temples]);

  const fetchTemples = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('temples')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      setTemples(data || []);
      setTotalTemples(data?.length || 0);
    } catch (error: any) {
      console.error('Error fetching temples:', error);
      toast({
        title: "Error Loading Temples",
        description: error.message || "Failed to load temples. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    if (!user) return;
    
    try {
      let { data, error } = await supabase
        .from('user_bhakthi_points')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Create initial record if doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from('user_bhakthi_points')
          .insert({
            user_id: user.id,
            total_points: 0,
            temples_visited: 0,
            total_visits: 0,
            current_discount_percent: 0
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        data = newData;
      } else if (error) {
        throw error;
      }
      
      if (data) {
        setUserScore(data.total_points);
        setTemplesVisited(data.temples_visited);
        setTotalVisits(data.total_visits);
        setCurrentDiscount(data.current_discount_percent);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const handleVisitTemple = async (templeId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to record temple visits",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if already visited today
      const { data: existingVisit } = await supabase
        .from('temple_visits')
        .select('*')
        .eq('user_id', user.id)
        .eq('temple_id', templeId)
        .gte('visit_date', new Date().toISOString().split('T')[0])
        .single();

      if (existingVisit) {
        toast({
          title: "Already Visited",
          description: "You've already recorded a visit to this temple today",
          variant: "destructive",
        });
        return;
      }

      // Record visit
      const { error: visitError } = await supabase
        .from('temple_visits')
        .insert({
          user_id: user.id,
          temple_id: templeId,
          points_earned: 100
        });

      if (visitError) throw visitError;

      // Check if this is a new temple visit
      const { data: previousVisits } = await supabase
        .from('temple_visits')
        .select('temple_id')
        .eq('user_id', user.id)
        .eq('temple_id', templeId);

      const isNewTemple = previousVisits?.length === 1;

      // Update points: 10 for visit + 100 if new temple
      const visitPoints = 10;
      const templeBonus = isNewTemple ? 100 : 0;
      const totalNewPoints = visitPoints + templeBonus;

      const newTotalPoints = userScore + totalNewPoints;
      const newTotalVisits = totalVisits + 1;
      const newTemplesVisited = isNewTemple ? templesVisited + 1 : templesVisited;
      const newDiscount = Math.floor(newTotalPoints / 1000) * 25;

      // Update user points
      const { error: updateError } = await supabase
        .from('user_bhakthi_points')
        .update({
          total_points: newTotalPoints,
          temples_visited: newTemplesVisited,
          total_visits: newTotalVisits,
          current_discount_percent: newDiscount
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setUserScore(newTotalPoints);
      setTotalVisits(newTotalVisits);
      setTemplesVisited(newTemplesVisited);
      setCurrentDiscount(newDiscount);

      toast({
        title: "Visit Recorded! 🎉",
        description: `+${totalNewPoints} points! ${isNewTemple ? '(New temple bonus!)' : ''} ${newDiscount > currentDiscount ? `You've unlocked ${newDiscount}% discount!` : ''}`,
      });
    } catch (error) {
      console.error('Error recording visit:', error);
      toast({
        title: "Error",
        description: "Failed to record temple visit",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-sacred/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-sacred bg-clip-text text-transparent">
              Test My Bhakthi
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover temples, track your spiritual journey, and earn rewards
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-sacred/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">{userScore}</div>
              <div className="text-sm text-muted-foreground">Bhakthi Score</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-divine/10 border-secondary/20">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-secondary mx-auto mb-2" />
              <div className="text-3xl font-bold text-secondary">{templesVisited}</div>
              <div className="text-sm text-muted-foreground">Temples Visited</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-temple/10 border-accent/20">
            <CardContent className="p-6 text-center">
              <Target className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-3xl font-bold text-accent">{totalTemples - templesVisited}</div>
              <div className="text-sm text-muted-foreground">Yet to Visit</div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{currentDiscount}% OFF</div>
              <div className="text-sm text-muted-foreground">Earned Discount</div>
            </CardContent>
          </Card>
        </div>

        {/* Map and Content Tabs */}
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Temple Map
            </TabsTrigger>
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <Compass className="h-4 w-4" />
              Nearby Temples
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              My Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Live Temple Map ({totalTemples} temples)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[500px] w-full rounded-lg" />
                ) : (
                  <TempleMap temples={temples} onVisitTemple={handleVisitTemple} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nearby" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Nearby Temples {userLocation && nearbyTemples.length > 0 && `(${nearbyTemples.filter(t => t.distance <= 50).length} within 50km)`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!userLocation ? (
                  <div className="text-center py-8">
                    <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Enable location access to find nearby temples</p>
                    <Button onClick={getUserLocation} variant="sacred">
                      Enable Location
                    </Button>
                  </div>
                ) : loading ? (
                  <Skeleton className="h-[500px] w-full rounded-lg" />
                ) : (
                  <TempleMap 
                    temples={temples} 
                    onVisitTemple={handleVisitTemple}
                    centerOnUser={true}
                    userLocation={[userLocation.lat, userLocation.lng]}
                    maxDistance={50}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Journey Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Temples Visited</span>
                      <span>{templesVisited} / {totalTemples}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-sacred h-3 rounded-full transition-all duration-500"
                        style={{ width: `${totalTemples > 0 ? (templesVisited / totalTemples) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Next Reward (1500 pts)</span>
                      <span>{userScore} / 1500</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-divine h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(userScore / 1500) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-6 w-6 text-accent" />
                      <span className="font-medium">First Temple Visit</span>
                    </div>
                    <Badge variant="default">Earned</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                      <Gift className="h-6 w-6 text-accent" />
                      <span className="font-medium">1000 Points Club</span>
                    </div>
                    <Badge variant="default">Earned</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Star className="h-6 w-6 text-muted-foreground" />
                      <span className="font-medium">Temple Explorer</span>
                    </div>
                    <Badge variant="outline">25 visits</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Bhakthi;
