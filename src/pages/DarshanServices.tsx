import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Star, Search, Heart, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { shareItem } from "@/utils/shareUtils";

interface Temple {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  image_url: string;
  rating: number;
  darshan_enabled: boolean;
}

const DarshanServices = () => {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [filteredTemples, setFilteredTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites('temple', user?.id);

  useEffect(() => {
    fetchTemples();
  }, []);

  useEffect(() => {
    filterTemples();
  }, [temples, searchTerm, stateFilter, cityFilter]);

  const fetchTemples = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("temples")
        .select("*")
        .eq('darshan_enabled', true)
        .order("name");

      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      setTemples(data || []);
      setFilteredTemples(data || []);
    } catch (error: any) {
      console.error("Error fetching temples:", error);
      toast({
        title: "Error Loading Temples",
        description: error.message || "Failed to load temples. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTemples = () => {
    let filtered = temples.filter(t => t.darshan_enabled);

    if (searchTerm) {
      filtered = filtered.filter(temple =>
        temple.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (stateFilter !== "all") {
      filtered = filtered.filter(temple => temple.state === stateFilter);
    }

    if (cityFilter !== "all") {
      filtered = filtered.filter(temple => temple.city === cityFilter);
    }

    filtered = filtered.sort((a, b) => {
      const aFav = isFavorite(a.id);
      const bFav = isFavorite(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

    setFilteredTemples(filtered);
  };

  const handleBookDarshan = (templeId: string) => {
    navigate(`/darshan/book/${templeId}`);
  };

  const uniqueStates = Array.from(new Set(temples.map(t => t.state).filter(Boolean)));
  const uniqueCities = Array.from(new Set(temples.map(t => t.city).filter(Boolean)));

  return (
    <>
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
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search temples by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {uniqueCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-3 mt-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemples.map((temple) => (
              <Card key={temple.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={temple.image_url || "/placeholder.svg"}
                    alt={temple.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(temple.id);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${isFavorite(temple.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareItem(temple.name, temple.description || '', window.location.origin + '/darshan/book/' + temple.id);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
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
        )}

        {!loading && filteredTemples.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {temples.length === 0 ? "No temples available at the moment" : "No temples match your filters"}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default DarshanServices;
