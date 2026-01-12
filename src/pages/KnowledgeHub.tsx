import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, BookOpen, Star, ChevronRight, Search, Heart, Share2, Download, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { shareItem } from "@/utils/shareUtils";
import jsPDF from "jspdf";

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
      const [templesData, contributionsData] = await Promise.all([
        supabase.from('temples').select('*').order('name'),
        supabase
          .from('temple_contributions')
          .select('*')
          .eq('status', 'approved')
          .order('temple_name')
      ]);
      
      if (templesData.error) {
        console.error('Database error:', templesData.error);
        throw templesData.error;
      }
      
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
      
      const allTemples = [...(templesData.data || []), ...contributionTemples];
      setTemples(allTemples);
      setFilteredTemples(allTemples);
    } catch (error: any) {
      console.error('Error fetching temples:', error);
      toast({
        title: "Error Loading Knowledge Hub",
        description: error.message || "Failed to load temples. Please refresh the page.",
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

    filtered = filtered.sort((a, b) => {
      const aFav = isFavorite(a.id);
      const bFav = isFavorite(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

    setFilteredTemples(filtered);
  };

  const handleTempleClick = (templeId: string) => {
    navigate(`/knowledge-hub/${templeId}`);
  };

  const downloadTemplePDF = useCallback(async (temple: Temple, e: React.MouseEvent) => {
    e.stopPropagation();
    
    toast({
      title: "Generating PDF",
      description: `Creating PDF for ${temple.name}...`,
    });

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      
      // Add watermark
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(60);
      pdf.text("Bhakthas", pageWidth / 2, pageHeight / 2, { 
        align: "center", 
        angle: 45 
      });
      
      // Reset text color
      pdf.setTextColor(0, 0, 0);
      
      // Header with brand
      pdf.setFillColor(255, 140, 0);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("Bhakthas", margin, 25);
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Your Divine Journey Companion", margin, 35);
      
      // Reset for content
      pdf.setTextColor(0, 0, 0);
      let yPos = 55;
      
      // Temple Name
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(temple.name, margin, yPos);
      yPos += 15;
      
      // Location
      if (temple.city && temple.state) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(`${temple.city}, ${temple.state}`, margin, yPos);
        yPos += 10;
      }
      
      // Rating
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.text(`Rating: ${temple.rating} / 5`, margin, yPos);
      yPos += 10;
      
      pdf.text(`Points: +${temple.points}`, margin, yPos);
      yPos += 15;
      
      // Description
      if (temple.description) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("About", margin, yPos);
        yPos += 8;
        
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        const descLines = pdf.splitTextToSize(temple.description, pageWidth - 2 * margin);
        pdf.text(descLines, margin, yPos);
        yPos += descLines.length * 6 + 10;
      }
      
      // Address
      if (temple.address) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Address", margin, yPos);
        yPos += 8;
        
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        const addrLines = pdf.splitTextToSize(temple.address, pageWidth - 2 * margin);
        pdf.text(addrLines, margin, yPos);
        yPos += addrLines.length * 6 + 10;
      }
      
      // Footer
      pdf.setFillColor(255, 140, 0);
      pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text("Downloaded from Bhakthas - www.bhakthas.com", pageWidth / 2, pageHeight - 12, { align: "center" });
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 5, { align: "center" });
      
      // Save PDF
      pdf.save(`${temple.name.replace(/\s+/g, '_')}_Bhakthas.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: `${temple.name} PDF has been downloaded successfully!`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const uniqueStates = Array.from(new Set(temples.map(t => t.state).filter(Boolean)));
  const uniqueCities = Array.from(new Set(temples.map(t => t.city).filter(Boolean)));

  return (
    <>
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
                    className="group hover:shadow-divine transition-all duration-300 cursor-pointer border-primary/10 hover:border-primary/30 bg-gradient-enlighten relative"
                    onClick={() => handleTempleClick(temple.id)}
                  >
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full shadow-lg h-8 w-8"
                        onClick={(e) => downloadTemplePDF(temple, e)}
                        title="Download PDF"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full shadow-lg h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(temple.id);
                        }}
                      >
                        <Heart className={`h-3 w-3 ${isFavorite(temple.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full shadow-lg h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          shareItem(temple.name, temple.description || '', window.location.origin + '/knowledge-hub/' + temple.id);
                        }}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-primary group-hover:text-secondary transition-colors pr-16">
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
    </>
  );
};

export default KnowledgeHub;
