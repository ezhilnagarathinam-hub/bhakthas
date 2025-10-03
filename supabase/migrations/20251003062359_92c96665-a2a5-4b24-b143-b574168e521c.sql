-- Create temples table
CREATE TABLE public.temples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  rating DECIMAL(2, 1) DEFAULT 4.5,
  points INTEGER DEFAULT 100,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.temples ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view temples
CREATE POLICY "Anyone can view temples" 
ON public.temples 
FOR SELECT 
USING (true);

-- Create temple_visits table to track user visits
CREATE TABLE public.temple_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  temple_id UUID NOT NULL REFERENCES public.temples(id) ON DELETE CASCADE,
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  photo_url TEXT,
  points_earned INTEGER DEFAULT 100,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, temple_id)
);

-- Enable RLS on temple_visits
ALTER TABLE public.temple_visits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own visits
CREATE POLICY "Users can view their own visits" 
ON public.temple_visits 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own visits
CREATE POLICY "Users can insert their own visits" 
ON public.temple_visits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own visits
CREATE POLICY "Users can update their own visits" 
ON public.temple_visits 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create storage bucket for temple photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('temple-photos', 'temple-photos', true);

-- Storage policies for temple photos
CREATE POLICY "Anyone can view temple photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'temple-photos');

CREATE POLICY "Authenticated users can upload temple photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'temple-photos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own temple photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'temple-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for temples timestamp
CREATE TRIGGER update_temples_updated_at
BEFORE UPDATE ON public.temples
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample temples
INSERT INTO public.temples (name, description, latitude, longitude, address, city, state, rating, points) VALUES
('Tirupati Balaji Temple', 'Famous temple dedicated to Lord Venkateswara', 13.6833, 79.3472, 'Tirumala Hills', 'Tirupati', 'Andhra Pradesh', 4.9, 100),
('ISKCON Temple', 'International Society for Krishna Consciousness', 28.5562, 77.2519, 'Hare Krishna Hill', 'Delhi', 'Delhi', 4.7, 100),
('Birla Mandir', 'Hindu temple built by Birla family', 28.6315, 77.2167, 'Mandir Marg', 'Delhi', 'Delhi', 4.6, 100),
('Jagannath Temple', 'Ancient Hindu temple dedicated to Lord Jagannath', 19.8048, 85.8317, 'Grand Road', 'Puri', 'Odisha', 4.8, 100),
('Golden Temple', 'Holiest Gurdwara of Sikhism', 31.6200, 74.8765, 'Golden Temple Road', 'Amritsar', 'Punjab', 4.9, 150),
('Meenakshi Temple', 'Historic Hindu temple dedicated to Goddess Meenakshi', 9.9195, 78.1193, 'Madurai Main', 'Madurai', 'Tamil Nadu', 4.8, 120),
('Konark Sun Temple', 'UNESCO World Heritage Site', 19.8876, 86.0945, 'Konark', 'Konark', 'Odisha', 4.7, 130),
('Somnath Temple', 'First among the twelve Jyotirlinga shrines', 20.8880, 70.4013, 'Veraval', 'Somnath', 'Gujarat', 4.8, 110);