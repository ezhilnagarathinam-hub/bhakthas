import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const Bhakthi = () => {
  const [userScore] = useState(1200);
  const [templesVisited] = useState(12);
  const [totalTemples] = useState(5000);
  
  const nearbyTemples = [
    {
      name: "Tirupati Balaji Temple",
      distance: "2.3 km",
      points: 100,
      visited: true,
      rating: 4.9
    },
    {
      name: "ISKCON Temple",
      distance: "5.1 km", 
      points: 100,
      visited: false,
      rating: 4.7
    },
    {
      name: "Birla Mandir",
      distance: "8.7 km",
      points: 100,
      visited: true,
      rating: 4.6
    },
    {
      name: "Jagannath Temple", 
      distance: "12.4 km",
      points: 100,
      visited: false,
      rating: 4.8
    }
  ];

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
                  Temples Across India
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted/30 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Map className="h-16 w-16 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Interactive Temple Map
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        To enable the full map experience with all temples in India,<br />
                        you'll need to connect your project to Supabase for backend functionality.
                      </p>
                      <Button variant="sacred">
                        Connect Supabase
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nearby" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Nearby Temples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {nearbyTemples.map((temple, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-sacred hover:shadow-sacred ${
                        temple.visited 
                          ? "bg-primary/5 border-primary/20" 
                          : "bg-muted/30 border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{temple.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {temple.distance}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-accent text-accent" />
                              {temple.rating}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={temple.visited ? "default" : "secondary"}>
                            {temple.visited ? "Visited" : `+${temple.points} pts`}
                          </Badge>
                          <Button 
                            variant={temple.visited ? "outline" : "sacred"} 
                            size="sm"
                            disabled={temple.visited}
                          >
                            {temple.visited ? "Completed" : "Visit"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                        style={{ width: `${(templesVisited / totalTemples) * 100}%` }}
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