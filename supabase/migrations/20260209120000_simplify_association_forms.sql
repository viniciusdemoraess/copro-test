-- Simplificação do formulário de associação
-- Tornando apenas campos essenciais como obrigatórios: nome, telefone, email, termos

ALTER TABLE association_forms
  ALTER COLUMN cpf DROP NOT NULL,
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN terms_accepted SET NOT NULL;

-- Adicionar constraint para garantir que pelo menos um telefone seja fornecido
ALTER TABLE association_forms
  ADD CONSTRAINT check_has_phone CHECK (
    phones IS NOT NULL AND
    jsonb_array_length(phones) > 0
  );

-- Comentários para documentação
COMMENT ON COLUMN association_forms.full_name IS 'Campo obrigatório - Nome completo do candidato';
COMMENT ON COLUMN association_forms.email IS 'Campo obrigatório - E-mail de contato';
COMMENT ON COLUMN association_forms.phones IS 'Campo obrigatório - Array de telefones de contato (mínimo 1)';
COMMENT ON COLUMN association_forms.terms_accepted IS 'Campo obrigatório - Aceite dos termos de associação';
COMMENT ON COLUMN association_forms.cpf IS 'Campo opcional - Pode ser preenchido posteriormente no processo';
