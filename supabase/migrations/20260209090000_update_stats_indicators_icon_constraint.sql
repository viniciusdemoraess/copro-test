-- Remove o constraint antigo que limitava os ícones
ALTER TABLE public.stats_indicators DROP CONSTRAINT IF EXISTS stats_indicators_icon_check;

-- Permite qualquer texto para o ícone (qualquer ícone do Lucide)
ALTER TABLE public.stats_indicators ALTER COLUMN icon TYPE TEXT;
ALTER TABLE public.stats_indicators ALTER COLUMN icon SET NOT NULL;
