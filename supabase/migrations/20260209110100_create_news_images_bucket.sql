INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news-images',
  'news-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Público pode ver imagens de notícias"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news-images');

CREATE POLICY "Autenticados podem fazer upload de imagens de notícias"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'news-images'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Autenticados podem atualizar imagens de notícias"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'news-images'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Autenticados podem deletar imagens de notícias"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'news-images'
    AND auth.uid() IS NOT NULL
  );
