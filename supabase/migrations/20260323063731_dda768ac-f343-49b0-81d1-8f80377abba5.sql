
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  variant_name text NOT NULL,
  variant_type text NOT NULL DEFAULT 'size',
  price numeric NOT NULL,
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view variants" ON public.product_variants
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage variants" ON public.product_variants
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
