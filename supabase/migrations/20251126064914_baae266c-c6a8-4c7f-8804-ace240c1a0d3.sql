-- Create storage buckets for uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('temple-images', 'temple-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('mantra-audio', 'mantra-audio', true, 10485760, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Storage policies for temple images
CREATE POLICY "Anyone can view temple images"
ON storage.objects FOR SELECT
USING (bucket_id = 'temple-images');

CREATE POLICY "Admins can upload temple images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'temple-images' AND
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Admins can delete temple images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'temple-images' AND
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Storage policies for mantra audio
CREATE POLICY "Anyone can view mantra audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'mantra-audio');

CREATE POLICY "Admins can upload mantra audio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'mantra-audio' AND
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Admins can delete mantra audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'mantra-audio' AND
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);