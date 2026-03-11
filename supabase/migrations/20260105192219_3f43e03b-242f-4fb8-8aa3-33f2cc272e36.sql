-- ============================================
-- TABELA: association_forms (candidatos)
-- ============================================
CREATE TABLE association_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados Pessoais (Step 1)
  cpf TEXT NOT NULL,
  rg TEXT,
  rg_orgao TEXT DEFAULT 'SSP-MT',
  full_name TEXT NOT NULL,
  birth_date TEXT,
  nationality TEXT,
  marital_status TEXT,
  profession TEXT,
  
  -- Contato (Step 2)
  phones JSONB DEFAULT '[]',
  whatsapp TEXT,
  
  -- Email (Step 3)
  email TEXT NOT NULL,
  email_confirmation TEXT,
  secondary_emails JSONB DEFAULT '[]',
  
  -- Endereço (Step 4)
  cep TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  
  -- Metadados de Submissão
  terms_accepted BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'em_analise', 'aprovado', 'rejeitado')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para Performance
-- ============================================
CREATE INDEX idx_association_forms_cpf ON association_forms(cpf);
CREATE INDEX idx_association_forms_email ON association_forms(email);
CREATE INDEX idx_association_forms_status ON association_forms(status);
CREATE INDEX idx_association_forms_created_at ON association_forms(created_at DESC);
CREATE INDEX idx_association_forms_city ON association_forms(city);
CREATE INDEX idx_association_forms_full_name ON association_forms(full_name);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE association_forms ENABLE ROW LEVEL SECURITY;

-- Público pode inserir (formulário do site)
CREATE POLICY "Público pode inserir candidaturas"
  ON association_forms FOR INSERT
  WITH CHECK (true);

-- Autenticados podem ler candidaturas
CREATE POLICY "Autenticados podem ler candidaturas"
  ON association_forms FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Autenticados podem atualizar candidaturas
CREATE POLICY "Autenticados podem atualizar candidaturas"
  ON association_forms FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Admins podem deletar candidaturas
CREATE POLICY "Admins podem deletar candidaturas"
  ON association_forms FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- TRIGGER para updated_at
-- ============================================
CREATE TRIGGER update_association_forms_updated_at 
  BEFORE UPDATE ON association_forms
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: candidato_history (histórico de ações)
-- ============================================
CREATE TABLE candidato_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID REFERENCES association_forms(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_candidato_history_candidato ON candidato_history(candidato_id);
CREATE INDEX idx_candidato_history_created ON candidato_history(created_at DESC);

ALTER TABLE candidato_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem ler histórico"
  ON candidato_history FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Autenticados podem inserir histórico"
  ON candidato_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime for association_forms
ALTER PUBLICATION supabase_realtime ADD TABLE association_forms;