CREATE POLICY "Public can read active email templates"
  ON email_templates FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
