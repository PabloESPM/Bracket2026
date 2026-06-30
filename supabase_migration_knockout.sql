-- =====================================================================
-- MIGRACIÓN: Columnas para detalles de partidos de eliminatoria
-- Fecha: 2026-06-30
--
-- Copia y pega este script en el "SQL Editor" de tu consola de Supabase
-- (supabase.com → proyecto → SQL Editor → New query)
-- =====================================================================

-- Añadir columna 'duration': indica si el partido terminó en tiempo
-- reglamentario (REGULAR), prórroga (EXTRA_TIME) o penaltis (PENALTY_SHOOTOUT)
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS duration TEXT DEFAULT 'REGULAR';

-- Añadir marcadores de penaltis (solo se rellenan si duration = 'PENALTY_SHOOTOUT')
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS home_penalties INTEGER NULL;

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS away_penalties INTEGER NULL;

-- Verificar que las columnas se crearon correctamente:
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'matches'
  AND column_name IN ('duration', 'home_penalties', 'away_penalties');
