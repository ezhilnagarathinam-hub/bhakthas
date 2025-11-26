import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const useGeocoding = () => {
  const [geocoding, setGeocoding] = useState(false);
  const { toast } = useToast();

  const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
    try {
      setGeocoding(true);

      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { address }
      });

      if (error) {
        toast({
          title: "Geocoding Error",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      return data as Coordinates;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to geocode address",
        variant: "destructive",
      });
      return null;
    } finally {
      setGeocoding(false);
    }
  };

  return { geocodeAddress, geocoding };
};
