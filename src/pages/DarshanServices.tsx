import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Star } from "lucide-react";

interface Temple {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  image_url: string;
  rating: number;
}

const DarshanServices = () => {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    try {
      const { data, error } = await supabase
        .from("temples")
        .select("*")
        .order("name");

      if (error) throw error;
      setTemples(data || []);
    } catch (error) {
      console.error("Error fetching temples:", error);
      toast({
        title: "Error",
        description: "Failed to load temples",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookDarshan = (templeId: string) => {
    navigate(`/darshan/book/${templeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading temples...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-sacred/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-sacred bg-clip-text text-transparent">
            Darshan Services
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Book your temple darshan online - Choose from various darshan options
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {temples.map((temple) => (
            <Card key={temple.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img
                  src={temple.image_url || "/placeholder.svg"}
                  alt={temple.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2">
                  <span>{temple.name}</span>
                  <div className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    {temple.rating}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {temple.description}
                </p>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">
                    {temple.address}, {temple.city}, {temple.state}
                  </span>
                </div>
                <Button
                  onClick={() => handleBookDarshan(temple.id)}
                  variant="sacred"
                  className="w-full"
                >
                  Book Darshan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {temples.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No temples available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DarshanServices;
