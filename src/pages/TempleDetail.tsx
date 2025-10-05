import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Star, ArrowLeft, Youtube, BookOpen } from "lucide-react";

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
  image_url: string | null;
}

const TempleDetail = () => {
  const { templeId } = useParams();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (templeId) {
      fetchTempleDetail();
    }
  }, [templeId]);

  const fetchTempleDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('temples')
        .select('*')
        .eq('id', templeId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Temple not found",
          description: "The requested temple could not be found",
          variant: "destructive",
        });
        return;
      }
      
      setTemple(data);
    } catch (error) {
      console.error('Error fetching temple:', error);
      toast({
        title: "Error",
        description: "Failed to load temple details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-12 w-48 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Temple not found</h2>
          <Link to="/knowledge-hub">
            <Button variant="sacred">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/knowledge-hub">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Hub
          </Button>
        </Link>

        {/* Temple Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-sacred bg-clip-text text-transparent mb-4">
            {temple.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{temple.city}, {temple.state}</span>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {temple.rating}
            </Badge>
            <Badge variant="outline">+{temple.points} points</Badge>
          </div>
          {temple.address && (
            <p className="text-sm text-muted-foreground mt-2">{temple.address}</p>
          )}
        </div>

        {/* YouTube Video Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600" />
              Temple Video Tour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <Youtube className="h-16 w-16 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Video content will be available soon
                </p>
                <p className="text-sm text-muted-foreground">
                  Stay tuned for a virtual tour of {temple.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Temple Blog/Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              About {temple.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none dark:prose-invert">
            {temple.description ? (
              <div className="whitespace-pre-wrap">{temple.description}</div>
            ) : (
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {temple.name} is a revered temple located in {temple.city}, {temple.state}. 
                  This sacred place holds immense spiritual significance and attracts devotees from all over the country.
                </p>
                <p>
                  The temple is known for its beautiful architecture and serene atmosphere, 
                  making it an ideal destination for spiritual seekers and pilgrims alike.
                </p>
                <p className="italic">
                  Detailed information and historical context will be added soon.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map Location */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">
                Coordinates: {temple.latitude.toFixed(6)}, {temple.longitude.toFixed(6)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TempleDetail;
