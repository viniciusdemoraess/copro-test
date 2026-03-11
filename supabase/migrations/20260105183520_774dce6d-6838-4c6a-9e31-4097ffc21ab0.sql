-- ============================================
-- TABELA: podcasts
-- ============================================
CREATE TABLE podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL UNIQUE,
  youtube_video_id TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  order_position INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_podcasts_active ON podcasts(active);
CREATE INDEX idx_podcasts_order ON podcasts(order_position);
CREATE INDEX idx_podcasts_youtube_id ON podcasts(youtube_video_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Público pode ver podcasts ativos"
  ON podcasts FOR SELECT
  USING (active = true);

CREATE POLICY "Autenticados podem ver todos podcasts"
  ON podcasts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem inserir podcasts"
  ON podcasts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem atualizar podcasts"
  ON podcasts FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem deletar podcasts"
  ON podcasts FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- TRIGGER para updated_at
-- ============================================
CREATE TRIGGER update_podcasts_updated_at 
  BEFORE UPDATE ON podcasts
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION para reordenar podcasts
-- ============================================
CREATE OR REPLACE FUNCTION reorder_podcasts(
  podcast_id UUID,
  new_position INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_position INTEGER;
BEGIN
  SELECT order_position INTO old_position 
  FROM podcasts 
  WHERE id = podcast_id;
  
  IF old_position IS NULL THEN
    RAISE EXCEPTION 'Podcast não encontrado';
  END IF;
  
  IF old_position < new_position THEN
    UPDATE podcasts 
    SET order_position = order_position - 1
    WHERE order_position > old_position 
      AND order_position <= new_position
      AND id != podcast_id;
  ELSIF old_position > new_position THEN
    UPDATE podcasts 
    SET order_position = order_position + 1
    WHERE order_position >= new_position 
      AND order_position < old_position
      AND id != podcast_id;
  END IF;
  
  UPDATE podcasts 
  SET order_position = new_position 
  WHERE id = podcast_id;
END;
$$;

-- ============================================
-- FUNCTION para ajustar ordem após exclusão
-- ============================================
CREATE OR REPLACE FUNCTION adjust_podcasts_order_after_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE podcasts
  SET order_position = order_position - 1
  WHERE order_position > OLD.order_position;
  
  RETURN OLD;
END;
$$;

CREATE TRIGGER adjust_podcasts_order_after_delete
  AFTER DELETE ON podcasts
  FOR EACH ROW
  EXECUTE FUNCTION adjust_podcasts_order_after_deletion();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE podcasts;