import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Star, Search } from "lucide-react";

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
  const [filteredTemples, setFilteredTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemples();
  }, []);

  useEffect(() => {
    filterTemples();
  }, [temples, searchTerm, stateFilter, cityFilter]);

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

  const filterTemples = () => {
    let filtered = [...temples];

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

    setFilteredTemples(filtered);
  };

  const handleBookDarshan = (templeId: string) => {
    navigate(`/darshan/book/${templeId}`);
  };

  const uniqueStates = Array.from(new Set(temples.map(t => t.state).filter(Boolean)));
  const uniqueCities = Array.from(new Set(temples.map(t => t.city).filter(Boolean)));

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
        {/* Search and Filters */}
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemples.map((temple) => (
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

        {filteredTemples.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {temples.length === 0 ? "No temples available at the moment" : "No temples match your filters"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DarshanServices;
