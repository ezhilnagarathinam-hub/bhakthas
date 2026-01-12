import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFavorites = (itemType: 'product' | 'temple' | 'mantra', userId: string | undefined) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchFavorites();
    } else {
      setFavorites(new Set());
      setLoading(false);
    }
  }, [userId, itemType]);

  const fetchFavorites = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', userId)
        .eq('item_type', itemType);

      if (!error && data) {
        setFavorites(new Set(data.map(f => f.item_id)));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = useCallback(async (itemId: string) => {
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please login to add favorites",
        variant: "destructive"
      });
      return;
    }

    const isFav = favorites.has(itemId);

    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .eq('item_type', itemType);

      if (!error) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        toast({ title: "Removed from favorites" });
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, item_id: itemId, item_type: itemType });

      if (!error) {
        setFavorites(prev => new Set(prev).add(itemId));
        toast({ title: "Added to favorites" });
      }
    }
  }, [userId, favorites, itemType, toast]);

  const isFavorite = useCallback((itemId: string) => favorites.has(itemId), [favorites]);

  return { favorites, toggleFavorite, isFavorite, loading };
};
