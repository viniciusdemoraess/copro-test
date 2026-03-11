INSERT INTO public.site_settings (setting_key, setting_value, setting_category, setting_description)
VALUES
  ('whatsapp_button_number', '5565984482372', 'whatsapp', 'Número do WhatsApp (formato internacional sem +)'),
  ('whatsapp_button_message', 'Olá! Gostaria de mais informações sobre a Cooprosoja.', 'whatsapp', 'Mensagem padrão do WhatsApp')
ON CONFLICT (setting_key) DO NOTHING;
