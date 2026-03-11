
CREATE TYPE email_template_type AS ENUM (
  'user_confirmation',
  'admin_notification',
  'custom'
);

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

CREATE INDEX idx_email_templates_type ON email_templates(type);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view email templates"
ON email_templates FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'editor')
  )
);

CREATE POLICY "Admins can manage email templates"
ON email_templates FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view email logs"
ON email_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'editor')
  )
);

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON email_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Template de confirmação para o usuário
INSERT INTO email_templates (name, type, subject, html_body, text_body, available_variables, description, is_active)
VALUES (
  'Confirmação de Solicitação - Usuário',
  'user_confirmation',
  'Solicitação de Associação Recebida - Cooprosoja',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background-color:#2D5016;color:white;padding:30px;text-align:center}.content{background-color:#f9f9f9;padding:30px}.footer{background-color:#333;color:white;padding:20px;text-align:center;font-size:12px}.highlight{color:#2D5016;font-weight:bold}</style></head><body><div class="container"><div class="header"><h1>Cooprosoja</h1><p>Cooperativa de Produtores de Soja</p></div><div class="content"><h2>Olá, {{nome}}!</h2><p>Recebemos sua solicitação para se tornar um cooperado da <strong>Cooprosoja</strong>.</p><p>Seus dados foram registrados com sucesso em nosso sistema:</p><ul><li><strong>Nome:</strong> {{nome}}</li><li><strong>E-mail:</strong> {{email}}</li><li><strong>Telefone:</strong> {{telefone}}</li></ul><p>Nossa equipe analisará sua solicitação e entrará em contato em breve para dar continuidade ao processo de associação.</p><p class="highlight">O que acontece agora?</p><ol><li>Análise dos dados enviados</li><li>Verificação de requisitos</li><li>Contato da nossa equipe em até 48 horas úteis</li></ol><p>Se você tiver alguma dúvida, não hesite em entrar em contato conosco.</p></div><div class="footer"><p><strong>Cooprosoja</strong></p><p>Telefone: {{telefone_cooprosoja}} | E-mail: {{email_cooprosoja}}</p><p>&copy; 2024 Cooprosoja - Todos os direitos reservados</p></div></div></body></html>',
  E'Olá, {{nome}}!\n\nRecebemos sua solicitação para se tornar um cooperado da Cooprosoja.\n\nSeus dados foram registrados com sucesso:\n- Nome: {{nome}}\n- E-mail: {{email}}\n- Telefone: {{telefone}}\n\nNossa equipe entrará em contato em breve.\n\nAtenciosamente,\nEquipe Cooprosoja',
  '["nome", "email", "telefone", "telefone_cooprosoja", "email_cooprosoja"]'::jsonb,
  'Email de confirmação enviado ao usuário após solicitação de associação',
  true
);

-- Template de notificação para admins
INSERT INTO email_templates (name, type, subject, html_body, text_body, available_variables, description, is_active)
VALUES (
  'Nova Solicitação - Admin',
  'admin_notification',
  '🆕 Nova Solicitação de Associação',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background-color:#1a237e;color:white;padding:20px}.content{background-color:#fff;padding:20px;border:1px solid #ddd}.data-table{width:100%;border-collapse:collapse;margin:20px 0}.data-table th{background-color:#f5f5f5;padding:10px;text-align:left;border-bottom:2px solid #ddd}.data-table td{padding:10px;border-bottom:1px solid #eee}.button{display:inline-block;padding:12px 30px;background-color:#2D5016;color:white;text-decoration:none;border-radius:5px;margin:20px 0}</style></head><body><div class="container"><div class="header"><h2>🆕 Nova Solicitação de Associação</h2><p>Uma nova pessoa demonstrou interesse em se tornar cooperado</p></div><div class="content"><h3>Dados do Candidato</h3><table class="data-table"><tr><th>Campo</th><th>Valor</th></tr><tr><td><strong>Nome Completo</strong></td><td>{{nome}}</td></tr><tr><td><strong>E-mail</strong></td><td>{{email}}</td></tr><tr><td><strong>Telefone</strong></td><td>{{telefone}}</td></tr><tr><td><strong>Data de Envio</strong></td><td>{{data_envio}}</td></tr></table><p><strong>Próximos passos:</strong></p><ol><li>Acessar o painel administrativo</li><li>Revisar os dados do candidato</li><li>Entrar em contato para prosseguir com o processo</li></ol><a href="{{admin_url}}" class="button">Acessar Painel Admin</a></div></div></body></html>',
  E'Nova Solicitação de Associação\n\nDados do Candidato:\n- Nome: {{nome}}\n- E-mail: {{email}}\n- Telefone: {{telefone}}\n- Data: {{data_envio}}\n\nAcesse o painel administrativo para mais detalhes.',
  '["nome", "email", "telefone", "data_envio", "admin_url"]'::jsonb,
  'Email de notificação enviado aos administradores quando há nova solicitação',
  true
);

COMMENT ON TABLE email_templates IS 'Templates HTML/texto de emails configuráveis via CMS (sem envio automático)';
COMMENT ON TABLE email_logs IS 'Log de emails para referência futura';
COMMENT ON COLUMN email_templates.available_variables IS 'Lista de variáveis disponíveis para substituição no template (formato JSON array)';
