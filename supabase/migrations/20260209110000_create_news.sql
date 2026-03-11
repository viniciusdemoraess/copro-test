CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  order_position INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_news_active ON public.news(active);
CREATE INDEX idx_news_order ON public.news(order_position);
CREATE INDEX idx_news_slug ON public.news(slug);
CREATE INDEX idx_news_created_at ON public.news(created_at DESC);

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público pode ver notícias ativas"
  ON public.news FOR SELECT
  USING (active = true);

CREATE POLICY "Autenticados podem ver todas notícias"
  ON public.news FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem inserir notícias"
  ON public.news FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem atualizar notícias"
  ON public.news FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem deletar notícias"
  ON public.news FOR DELETE
  USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
