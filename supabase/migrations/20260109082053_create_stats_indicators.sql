-- ============================================
-- TABELA: stats_indicators
-- ============================================
CREATE TABLE public.stats_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value NUMERIC(10, 2) NOT NULL,
  prefix TEXT DEFAULT '',
  suffix TEXT DEFAULT '',
  label TEXT DEFAULT '',
  icon TEXT CHECK (icon IN ('MapPin', 'Users', 'Wheat')) NOT NULL,
  active BOOLEAN DEFAULT true,
  order_position INTEGER NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_stats_indicators_active ON public.stats_indicators(active);
CREATE INDEX idx_stats_indicators_order ON public.stats_indicators(order_position);

-- Constraint para limitar a 3 indicadores ativos
CREATE UNIQUE INDEX idx_stats_indicators_unique_order 
ON public.stats_indicators(order_position) 
WHERE active = true;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.stats_indicators ENABLE ROW LEVEL SECURITY;

-- Público pode ver indicadores ativos
CREATE POLICY "Público pode ver indicadores ativos"
  ON public.stats_indicators FOR SELECT
  USING (active = true);

-- Autenticados podem ver todos
CREATE POLICY "Autenticados podem ver todos indicadores"
  ON public.stats_indicators FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Autenticados podem inserir
CREATE POLICY "Autenticados podem inserir indicadores"
  ON public.stats_indicators FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Autenticados podem atualizar
CREATE POLICY "Autenticados podem atualizar indicadores"
  ON public.stats_indicators FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Autenticados podem deletar
CREATE POLICY "Autenticados podem deletar indicadores"
  ON public.stats_indicators FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- TRIGGER para updated_at
-- ============================================
CREATE TRIGGER update_stats_indicators_updated_at 
  BEFORE UPDATE ON public.stats_indicators
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNCTION para validar limite de 3 indicadores ativos
-- ============================================
CREATE OR REPLACE FUNCTION check_max_active_indicators()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  IF NEW.active = true THEN
    SELECT COUNT(*) INTO active_count
    FROM public.stats_indicators
    WHERE active = true AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    IF active_count >= 3 THEN
      RAISE EXCEPTION 'Máximo de 3 indicadores ativos permitidos';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_max_active_stats_indicators
  BEFORE INSERT OR UPDATE ON public.stats_indicators
  FOR EACH ROW
  EXECUTE FUNCTION check_max_active_indicators();
