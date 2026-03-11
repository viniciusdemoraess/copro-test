-- ============================================
-- TABELA: info_cards
-- ============================================
CREATE TABLE info_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('beneficio', 'servico', 'geral')),
  icon_name TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text TEXT DEFAULT 'Saiba mais',
  background_color TEXT DEFAULT '#ffffff',
  icon_color TEXT DEFAULT '#0e873d',
  order_position INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_info_cards_active ON info_cards(active);
CREATE INDEX idx_info_cards_category ON info_cards(category);
CREATE INDEX idx_info_cards_order ON info_cards(category, order_position);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE info_cards ENABLE ROW LEVEL SECURITY;

-- Público pode ver cards ativos
CREATE POLICY "Público pode ver cards ativos"
  ON info_cards FOR SELECT
  USING (active = true);

-- Autenticados podem ver todos cards
CREATE POLICY "Autenticados podem ver todos cards"
  ON info_cards FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Autenticados podem inserir cards
CREATE POLICY "Autenticados podem inserir cards"
  ON info_cards FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Autenticados podem atualizar cards
CREATE POLICY "Autenticados podem atualizar cards"
  ON info_cards FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Autenticados podem deletar cards
CREATE POLICY "Autenticados podem deletar cards"
  ON info_cards FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- TRIGGER para updated_at
-- ============================================
CREATE TRIGGER update_info_cards_updated_at 
  BEFORE UPDATE ON info_cards
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION para reordenar cards por categoria
-- ============================================
CREATE OR REPLACE FUNCTION reorder_info_cards(
  card_id UUID,
  new_position INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_position INTEGER;
  card_category TEXT;
BEGIN
  -- Pegar posição e categoria atual
  SELECT order_position, category 
  INTO old_position, card_category
  FROM info_cards 
  WHERE id = card_id;
  
  IF old_position IS NULL THEN
    RAISE EXCEPTION 'Card não encontrado';
  END IF;
  
  IF old_position < new_position THEN
    -- Movendo para baixo
    UPDATE info_cards 
    SET order_position = order_position - 1
    WHERE category = card_category
      AND order_position > old_position 
      AND order_position <= new_position
      AND id != card_id;
  ELSIF old_position > new_position THEN
    -- Movendo para cima
    UPDATE info_cards 
    SET order_position = order_position + 1
    WHERE category = card_category
      AND order_position >= new_position 
      AND order_position < old_position
      AND id != card_id;
  END IF;
  
  -- Atualizar posição do item movido
  UPDATE info_cards 
  SET order_position = new_position 
  WHERE id = card_id;
END;
$$;

-- ============================================
-- FUNCTION para ajustar ordem após exclusão
-- ============================================
CREATE OR REPLACE FUNCTION adjust_info_cards_order_after_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Diminuir a ordem de todos os cards após o deletado (mesma categoria)
  UPDATE info_cards
  SET order_position = order_position - 1
  WHERE category = OLD.category
    AND order_position > OLD.order_position;
  
  RETURN OLD;
END;
$$;

CREATE TRIGGER adjust_info_cards_order_after_delete
  AFTER DELETE ON info_cards
  FOR EACH ROW
  EXECUTE FUNCTION adjust_info_cards_order_after_deletion();

-- ============================================
-- Storage bucket para imagens de cards
-- ============================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('card-images', 'card-images', true);

-- Políticas de acesso ao bucket
CREATE POLICY "Público pode ver imagens de cards"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'card-images');

CREATE POLICY "Autenticados podem fazer upload de imagens de cards"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'card-images' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Autenticados podem deletar imagens de cards"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'card-images' 
    AND auth.uid() IS NOT NULL
  );

-- Enable realtime for info_cards
ALTER PUBLICATION supabase_realtime ADD TABLE info_cards;