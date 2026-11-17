-- Tabela de Classes/Modelos de Colheitadeiras
-- Para uso no campo modelo_colheitadeira da calculadora de viabilidade

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classe TEXT NOT NULL UNIQUE,
  plataforma_pes INTEGER,
  potencia TEXT,
  preco_compra NUMERIC,
  vida_util_anos INTEGER,
  valor_revenda_percent NUMERIC,
  manutencao_percent NUMERIC,
  seguro_percent NUMERIC,
  rendimento_ha_hora NUMERIC,
  usar_sugestoes BOOLEAN DEFAULT true,
  quantidade_personalizada INTEGER,
  hectares_por_dia NUMERIC,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para buscar pelo classe
CREATE INDEX idx_classes_classe ON classes(classe);

-- Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Público pode ler todas as classes
CREATE POLICY "Public can read classes"
  ON classes FOR SELECT
  USING (true);

-- Apenas admin pode inserir/atualizar/deletar
CREATE POLICY "Admin can manage classes"
  ON classes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can update classes"
  ON classes FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can delete classes"
  ON classes FOR DELETE
  USING (auth.uid() IS NOT NULL);
