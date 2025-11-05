-- Create table for temple contributions
CREATE TABLE public.temple_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  temple_name TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.temple_contributions ENABLE ROW LEVEL SECURITY;

-- Create policies for temple contributions
CREATE POLICY "Users can insert their own contributions"
ON public.temple_contributions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own contributions"
ON public.temple_contributions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contributions"
ON public.temple_contributions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all contributions"
ON public.temple_contributions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_temple_contributions_updated_at
BEFORE UPDATE ON public.temple_contributions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();