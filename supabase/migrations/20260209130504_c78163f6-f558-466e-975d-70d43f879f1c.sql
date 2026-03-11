
-- Tabela de configurações SMTP
CREATE TABLE smtp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  secure BOOLEAN DEFAULT false,
  username TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipos de templates disponíveis
CREATE TYPE email_template_type AS ENUM (
  'user_confirmation',
  'admin_notification',
  'custom'
);

-- Tabela de templates de email
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type email_template_type NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  available_variables JSONB DEFAULT '[]',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- Partial unique index (only one active template per type)
CREATE UNIQUE INDEX idx_email_templates_unique_active_type ON email_templates(type) WHERE is_active = true;

-- Tabela de log de emails enviados
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'failed', 'pending')) DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX idx_email_templates_type ON email_templates(type);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);

-- RLS
ALTER TABLE smtp_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view SMTP settings"
  ON smtp_settings FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage SMTP settings"
  ON smtp_settings FOR ALL
  USING (is_admin(auth.uid()));

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view email templates"
  ON email_templates FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins can manage email templates"
  ON email_templates FOR ALL
  USING (is_admin(auth.uid()));

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view email logs"
  ON email_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "System can insert email logs"
  ON email_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- TRIGGERS
CREATE TRIGGER update_smtp_settings_updated_at
  BEFORE UPDATE ON smtp_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- DADOS INICIAIS
INSERT INTO smtp_settings (name, host, port, secure, username, is_active)
VALUES (
  'Office 365 - Cooprosoja',
  'smtp.office365.com',
  587,
  false,
  'site@cooprosoja.com.br',
  true
);

INSERT INTO email_templates (name, type, subject, html_body, text_body, available_variables, description, is_active)
VALUES (
  'Confirmação de Solicitação - Usuário',
  'user_confirmation',
  'Solicitação de Associação Recebida - Cooprosoja',
  '<html><body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden"><div style="background:#0e873d;color:#fff;padding:30px;text-align:center"><h1>Cooprosoja</h1><p>Cooperativa de Produtores de Soja</p></div><div style="padding:30px"><h2>Olá, {{nome}}!</h2><p>Recebemos sua solicitação para se tornar um cooperado da Cooprosoja.</p><p>Seus dados foram registrados com sucesso:</p><ul><li>Nome: {{nome}}</li><li>E-mail: {{email}}</li><li>Telefone: {{telefone}}</li></ul><p>Nossa equipe analisará sua solicitação e entrará em contato em breve.</p><h3>O que acontece agora?</h3><ol><li>Análise dos dados enviados</li><li>Verificação de requisitos</li><li>Contato da nossa equipe em até 48 horas úteis</li></ol></div><div style="background:#f5f5f5;padding:20px;text-align:center;font-size:12px;color:#666"><p>Cooprosoja</p><p>Telefone: {{telefone_cooprosoja}} | E-mail: {{email_cooprosoja}}</p><p>© 2024 Cooprosoja - Todos os direitos reservados</p></div></div></body></html>',
  'Olá, {{nome}}! Recebemos sua solicitação para se tornar um cooperado da Cooprosoja. Seus dados: Nome: {{nome}}, E-mail: {{email}}, Telefone: {{telefone}}. Nossa equipe entrará em contato em breve. Atenciosamente, Equipe Cooprosoja',
  '["nome", "email", "telefone", "telefone_cooprosoja", "email_cooprosoja"]'::jsonb,
  'Email de confirmação enviado ao usuário após solicitação de associação',
  true
);

INSERT INTO email_templates (name, type, subject, html_body, text_body, available_variables, description, is_active)
VALUES (
  'Nova Solicitação - Admin',
  'admin_notification',
  '🆕 Nova Solicitação de Associação',
  '<html><body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden"><div style="background:#1a1a2e;color:#fff;padding:30px;text-align:center"><h1>🆕 Nova Solicitação de Associação</h1><p>Uma nova pessoa demonstrou interesse em se tornar cooperado</p></div><div style="padding:30px"><h2>Dados do Candidato</h2><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Nome</td><td style="padding:8px;border:1px solid #ddd">{{nome}}</td></tr><tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">E-mail</td><td style="padding:8px;border:1px solid #ddd">{{email}}</td></tr><tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Telefone</td><td style="padding:8px;border:1px solid #ddd">{{telefone}}</td></tr><tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Data</td><td style="padding:8px;border:1px solid #ddd">{{data_envio}}</td></tr></table><h3>Próximos passos:</h3><ol><li>Revisar os dados do candidato</li><li>Entrar em contato para prosseguir</li></ol><a href="{{admin_url}}" style="display:inline-block;background:#0e873d;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none">Acessar Painel Admin</a></div></div></body></html>',
  'Nova Solicitação de Associação - Nome: {{nome}}, E-mail: {{email}}, Telefone: {{telefone}}, Data: {{data_envio}}. Acesse o painel administrativo para mais detalhes.',
  '["nome", "email", "telefone", "data_envio", "admin_url"]'::jsonb,
  'Email de notificação enviado aos administradores quando há nova solicitação',
  true
);

COMMENT ON TABLE smtp_settings IS 'Configurações SMTP para envio de emails (senha armazenada como secret)';
COMMENT ON TABLE email_templates IS 'Templates HTML/texto de emails configuráveis via CMS';
COMMENT ON TABLE email_logs IS 'Log de todos os emails enviados pelo sistema';
COMMENT ON COLUMN email_templates.available_variables IS 'Lista de variáveis disponíveis para substituição no template (formato JSON array)';
