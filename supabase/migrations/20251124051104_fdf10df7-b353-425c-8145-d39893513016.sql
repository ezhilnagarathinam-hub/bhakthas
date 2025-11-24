-- Create favorites table for products, temples, and mantras
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'temple', 'mantra')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);

-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Add darshan_enabled field to temples table
ALTER TABLE public.temples 
ADD COLUMN IF NOT EXISTS darshan_enabled BOOLEAN DEFAULT false;

-- Create darshan_packages table
CREATE TABLE IF NOT EXISTS public.darshan_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temple_id UUID NOT NULL REFERENCES public.temples(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  package_type TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on darshan_packages
ALTER TABLE public.darshan_packages ENABLE ROW LEVEL SECURITY;

-- RLS policies for darshan_packages
CREATE POLICY "Anyone can view active darshan packages"
  ON public.darshan_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage darshan packages"
  ON public.darshan_packages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item_type ON public.favorites(item_type);
CREATE INDEX IF NOT EXISTS idx_darshan_packages_temple_id ON public.darshan_packages(temple_id);