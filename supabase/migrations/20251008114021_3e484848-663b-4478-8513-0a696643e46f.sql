-- Create enum for darshan types
CREATE TYPE public.darshan_type AS ENUM ('standard_100', 'standard_500', 'vip_1000', 'free');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('awaiting', 'confirmed', 'cancelled', 'refunded');

-- Create darshan_bookings table
CREATE TABLE public.darshan_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  temple_id UUID NOT NULL REFERENCES public.temples(id) ON DELETE CASCADE,
  darshan_type darshan_type NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  darshan_date DATE NOT NULL,
  darshan_time TIME NOT NULL,
  status booking_status NOT NULL DEFAULT 'awaiting',
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.darshan_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own bookings"
ON public.darshan_bookings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
ON public.darshan_bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
ON public.darshan_bookings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings"
ON public.darshan_bookings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_darshan_bookings_updated_at
BEFORE UPDATE ON public.darshan_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  invoice_num TEXT;
BEGIN
  invoice_num := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN invoice_num;
END;
$$;