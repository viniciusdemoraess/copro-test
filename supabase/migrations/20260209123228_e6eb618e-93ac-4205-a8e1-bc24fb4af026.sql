
ALTER TABLE public.stats_indicators DROP CONSTRAINT IF EXISTS stats_indicators_icon_check;
ALTER TABLE public.stats_indicators ALTER COLUMN icon TYPE TEXT;
ALTER TABLE public.stats_indicators ALTER COLUMN icon SET NOT NULL;
