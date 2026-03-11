-- Permitir acesso público (anônimo) para leitura de site_settings
CREATE POLICY "Public can read site settings"
ON site_settings FOR SELECT
TO anon
USING (true);

-- Permitir que service_role insira logs de email (usado pela Edge Function)
CREATE POLICY "Service role can insert email logs"
ON email_logs FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update email logs"
ON email_logs FOR UPDATE
TO service_role
USING (true);

-- Permitir que service_role leia templates e configurações SMTP
CREATE POLICY "Service role can read email templates"
ON email_templates FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can read SMTP settings"
ON smtp_settings FOR SELECT
TO service_role
USING (true);