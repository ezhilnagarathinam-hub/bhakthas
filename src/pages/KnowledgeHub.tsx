import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, BookOpen, Star, ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const KnowledgeHub = () => {
  const [temples, setTemples] = useState<Temple[]>([]);
  const [filteredTemples, setFilteredTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [deityFilter, setDeityFilter] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemples();
  }, []);

  useEffect(() => {
    filterTemples();
  }, [temples, searchTerm, stateFilter, cityFilter, deityFilter]);

  const fetchTemples = async () => {
    try {
      setLoading(true);
      // Fetch both regular temples and approved contributions
      const [templesData, contributionsData] = await Promise.all([
        supabase.from('temples').select('*').order('name'),
        supabase
          .from('temple_contributions')
          .select('*')
          .eq('status', 'approved')
          .order('temple_name')
      ]);
      
      if (templesData.error) throw templesData.error;
      
      // Convert contributions to temple format
      const contributionTemples = (contributionsData.data || []).map(contrib => ({
        id: contrib.id,
        name: contrib.temple_name,
        description: contrib.description,
        latitude: contrib.latitude || 0,
        longitude: contrib.longitude || 0,
        address: contrib.address,
        city: contrib.city,
        state: contrib.state,
        rating: 4.5,
        points: 100,
      }));
      
      setTemples([...(templesData.data || []), ...contributionTemples]);
    } catch (error) {
      console.error('Error fetching temples:', error);
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

  const handleTempleClick = (templeId: string) => {
    navigate(`/knowledge-hub/${templeId}`);
  };

  const uniqueStates = Array.from(new Set(temples.map(t => t.state).filter(Boolean)));
  const uniqueCities = Array.from(new Set(temples.map(t => t.city).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-sacred/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-sacred bg-clip-text text-transparent">
              Temple Knowledge Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore temples across India and discover their rich history and significance
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20 shadow-divine">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="h-6 w-6 text-primary" />
              Temple Directory
            </CardTitle>
            <CardDescription>
              Discover {temples.length} sacred temples across India
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search and Filters */}
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

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemples.map((temple) => (
                  <Card 
                    key={temple.id} 
                    className="group hover:shadow-divine transition-all duration-300 cursor-pointer border-primary/10 hover:border-primary/30 bg-gradient-enlighten"
                    onClick={() => handleTempleClick(temple.id)}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-primary group-hover:text-secondary transition-colors">
                            {temple.name}
                          </h3>
                          {temple.city && temple.state && (
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {temple.city}, {temple.state}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-sacred rounded-full flex items-center justify-center shadow-sacred">
                            <span className="text-white text-lg">🕉️</span>
                          </div>
                        </div>
                      </div>
                      
                      {temple.description && (
                        <p className="text-sm text-foreground/70 line-clamp-2">
                          {temple.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-accent fill-accent" />
                          <span className="text-sm font-medium">{temple.rating}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="group-hover:text-primary group-hover:translate-x-1 transition-all"
                        >
                          Explore
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeHub;
