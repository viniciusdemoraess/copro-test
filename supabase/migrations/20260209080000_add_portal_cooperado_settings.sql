INSERT INTO public.site_settings (setting_key, setting_value, setting_category, setting_description)
VALUES
  ('show_portal_cooperado', 'true', 'header', 'Exibir botão Portal do Cooperado?'),
  ('portal_cooperado_url', '', 'header', 'URL do Portal do Cooperado')
ON CONFLICT (setting_key) DO NOTHING;
