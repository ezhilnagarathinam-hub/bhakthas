import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";

interface Temple {
  id: string;
  name: string;
  quick_info: string | null;
}

const FeaturedTempleInfo = () => {
  const [featuredTemple, setFeaturedTemple] = useState<Temple | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedTemple();
  }, []);

  const fetchFeaturedTemple = async () => {
    try {
      const { data, error } = await supabase
        .from('temples')
        .select('id, name, quick_info')
        .not('quick_info', 'is', null)
        .limit(1)
        .single();
      
      if (error) throw error;
      setFeaturedTemple(data);
    } catch (error) {
      console.error('Error fetching featured temple:', error);
    }
  };

  if (!featuredTemple || !featuredTemple.quick_info) return null;

  return (
    <Card className="bg-gradient-enlighten border-primary/20 shadow-divine overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-sacred rounded-full flex items-center justify-center shadow-sacred">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              🕉️ Divine Insight
            </h3>
            <p className="text-foreground/80 leading-relaxed">
              {featuredTemple.quick_info}
            </p>
            <Button 
              variant="sacred" 
              size="sm" 
              onClick={() => navigate(`/knowledge-hub/${featuredTemple.id}`)}
              className="group mt-2"
            >
              Learn More
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedTempleInfo;
