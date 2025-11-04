-- Add RLS policies for users to manage their own pending orders
CREATE POLICY "Users can update their own pending orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete their own pending orders"
ON public.orders
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- Update invoice generation to use cryptographically secure random values
DROP FUNCTION IF EXISTS public.generate_invoice_number();

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invoice_num TEXT;
  random_hex TEXT;
BEGIN
  -- Generate cryptographically secure random value
  random_hex := encode(gen_random_bytes(6), 'hex');
  invoice_num := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(random_hex);
  RETURN invoice_num;
END;
$$;