CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_category TEXT NOT NULL DEFAULT 'general',
  setting_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings FOR DELETE
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (setting_key, setting_value, setting_category, setting_description) VALUES
  ('contact_phone', '(65) 99999-9999', 'contact', 'Telefone principal exibido no topo do site'),
  ('contact_email', 'contato@cooprosoja.com.br', 'contact', 'E-mail principal de contato'),
  ('whatsapp_number', '5565999999999', 'contact', 'Número do WhatsApp (formato internacional sem +)'),
  ('site_name', 'Cooprosoja', 'general', 'Nome do site'),
  ('site_tagline', 'Cooperativa de Produtores de Soja', 'general', 'Slogan/tagline do site')
ON CONFLICT (setting_key) DO NOTHING;

CREATE INDEX idx_site_settings_key ON public.site_settings(setting_key);
CREATE INDEX idx_site_settings_category ON public.site_settings(setting_category);

COMMENT ON TABLE public.site_settings IS 'Global site configuration settings managed via CMS';