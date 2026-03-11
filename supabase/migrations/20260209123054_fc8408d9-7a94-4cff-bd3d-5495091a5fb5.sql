
CREATE OR REPLACE FUNCTION check_max_active_indicators()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  active_count INTEGER;
BEGIN
  IF NEW.active = true THEN
    SELECT COUNT(*) INTO active_count
    FROM public.stats_indicators
    WHERE active = true AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    IF active_count >= 3 THEN
      RAISE EXCEPTION 'Máximo de 3 indicadores ativos permitidos';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
