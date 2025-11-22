-- Create user_bhakthi_points table to track user points and visits
CREATE TABLE IF NOT EXISTS public.user_bhakthi_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_points INTEGER DEFAULT 0,
  temples_visited INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  current_discount_percent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_bhakthi_points ENABLE ROW LEVEL SECURITY;

-- Users can view their own points
CREATE POLICY "Users can view their own points"
ON public.user_bhakthi_points
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own points record
CREATE POLICY "Users can insert their own points"
ON public.user_bhakthi_points
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own points
CREATE POLICY "Users can update their own points"
ON public.user_bhakthi_points
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all points
CREATE POLICY "Admins can view all points"
ON public.user_bhakthi_points
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can view active promo codes
CREATE POLICY "Anyone can view active promo codes"
ON public.promo_codes
FOR SELECT
USING (is_active = true);

-- Admins can manage promo codes
CREATE POLICY "Admins can manage promo codes"
ON public.promo_codes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update updated_at
CREATE TRIGGER update_user_bhakthi_points_updated_at
BEFORE UPDATE ON public.user_bhakthi_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at
BEFORE UPDATE ON public.promo_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample promo codes
INSERT INTO public.promo_codes (code, discount_percent, max_uses) VALUES
('BHAKTHI25', 25, 100),
('TEMPLE50', 50, 50),
('DIVINE10', 10, 200);