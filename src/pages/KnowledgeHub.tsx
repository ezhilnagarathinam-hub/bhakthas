import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TempleMap from "@/components/TempleMap";
import { MapPin, BookOpen } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemples();
  }, []);

  const fetchTemples = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('temples')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setTemples(data || []);
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

  const handleTempleClick = (templeId: string) => {
    navigate(`/knowledge-hub/${templeId}`);
  };

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Temple Directory ({temples.length} temples)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[500px] w-full rounded-lg" />
            ) : (
              <TempleMap temples={temples} onVisitTemple={handleTempleClick} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeHub;
