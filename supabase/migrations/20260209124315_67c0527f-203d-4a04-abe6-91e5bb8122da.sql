INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'about-images',
  'about-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Público pode ver imagens about"
ON storage.objects FOR SELECT
USING (bucket_id = 'about-images');

CREATE POLICY "Autenticados podem fazer upload de imagens about"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'about-images'
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Autenticados podem atualizar imagens about"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'about-images'
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Autenticados podem deletar imagens about"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'about-images'
    AND auth.uid() IS NOT NULL
);