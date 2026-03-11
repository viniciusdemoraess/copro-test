-- ============================================
-- TABELA: carousel_slides
-- ============================================
CREATE TABLE public.carousel_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  order_position INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_carousel_active ON public.carousel_slides(active);
CREATE INDEX idx_carousel_order ON public.carousel_slides(order_position);

-- ============================================
-- TABELA: featured_video
-- ============================================
CREATE TABLE public.featured_video (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT CHECK (video_type IN ('youtube', 'vimeo', 'gdrive', 'direct')) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: popup_video
-- ============================================
CREATE TABLE public.popup_video (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT CHECK (video_type IN ('youtube', 'vimeo', 'gdrive', 'direct')) NOT NULL,
  delay_seconds INTEGER DEFAULT 2,
  active BOOLEAN DEFAULT true,
  show_once_per_session BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Carousel
ALTER TABLE public.carousel_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público pode ver slides ativos"
  ON public.carousel_slides FOR SELECT
  USING (active = true);

CREATE POLICY "Autenticados podem ver todos slides"
  ON public.carousel_slides FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem inserir slides"
  ON public.carousel_slides FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem atualizar slides"
  ON public.carousel_slides FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem deletar slides"
  ON public.carousel_slides FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Featured Video
ALTER TABLE public.featured_video ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público pode ver vídeo destaque ativo"
  ON public.featured_video FOR SELECT
  USING (active = true);

CREATE POLICY "Autenticados podem ver todos vídeos destaque"
  ON public.featured_video FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem gerenciar vídeo destaque"
  ON public.featured_video FOR ALL
  USING (auth.uid() IS NOT NULL);

-- PopUp Video
ALTER TABLE public.popup_video ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público pode ver popup ativo"
  ON public.popup_video FOR SELECT
  USING (active = true);

CREATE POLICY "Autenticados podem ver todos popups"
  ON public.popup_video FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem gerenciar popup"
  ON public.popup_video FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- TRIGGERS para updated_at
-- ============================================
CREATE TRIGGER update_carousel_slides_updated_at 
  BEFORE UPDATE ON public.carousel_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_featured_video_updated_at 
  BEFORE UPDATE ON public.featured_video
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_popup_video_updated_at 
  BEFORE UPDATE ON public.popup_video
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNCTION para reordenar slides
-- ============================================
CREATE OR REPLACE FUNCTION public.reorder_carousel_slides(
  slide_id UUID,
  new_position INTEGER
)
RETURNS void AS $$
DECLARE
  old_position INTEGER;
BEGIN
  SELECT order_position INTO old_position FROM public.carousel_slides WHERE id = slide_id;
  
  IF old_position < new_position THEN
    UPDATE public.carousel_slides 
    SET order_position = order_position - 1
    WHERE order_position > old_position AND order_position <= new_position;
  ELSE
    UPDATE public.carousel_slides 
    SET order_position = order_position + 1
    WHERE order_position >= new_position AND order_position < old_position;
  END IF;
  
  UPDATE public.carousel_slides SET order_position = new_position WHERE id = slide_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('carousel-images', 'carousel-images', true);

-- Políticas de acesso para storage
CREATE POLICY "Público pode ver imagens do carrossel"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'carousel-images');

CREATE POLICY "Autenticados podem fazer upload no carrossel"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'carousel-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem atualizar imagens do carrossel"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'carousel-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem deletar imagens do carrossel"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'carousel-images' AND auth.uid() IS NOT NULL);