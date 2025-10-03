import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [userScore] = useState(1200);
  const [templesVisited] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    try {
      const { data, error } = await supabase
        .from('temples')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTemples(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading temples",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
              <div className="text-3xl font-bold text-accent">{temples.length - templesVisited}</div>
              <div className="text-sm text-muted-foreground">Yet to Visit</div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">25% OFF</div>
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
                  Temples Across India ({temples.length} temples)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-96 bg-muted/30 rounded-lg border flex items-center justify-center">
                    <p className="text-muted-foreground">Loading temples...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {temples.map((temple) => (
                        <Card key={temple.id} className="hover:shadow-sacred transition-sacred">
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground mb-2">{temple.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {temple.description || 'Sacred temple'}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {temple.city}, {temple.state}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-accent text-accent" />
                                {temple.rating}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <Badge variant="secondary">+{temple.points} pts</Badge>
                              <Button variant="sacred" size="sm">
                                Visit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nearby" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  All Temples
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading temples...</p>
                ) : (
                  <div className="space-y-4">
                    {temples.map((temple) => (
                      <div
                        key={temple.id}
                        className="p-4 rounded-lg border transition-sacred hover:shadow-sacred bg-muted/30 border-border"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{temple.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {temple.description || 'Sacred temple'}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {temple.city}, {temple.state}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-accent text-accent" />
                                {temple.rating}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">
                              +{temple.points} pts
                            </Badge>
                            <Button 
                              variant="sacred" 
                              size="sm"
                            >
                              Visit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                      <span>{templesVisited} / {temples.length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-sacred h-3 rounded-full transition-all duration-500"
                        style={{ width: temples.length > 0 ? `${(templesVisited / temples.length) * 100}%` : '0%' }}
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