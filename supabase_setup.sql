-- =====================================================================
-- SCRIPT DE CONFIGURACIÓN DE SUPABASE PARA EL MUNDIAL FIFA 2026 PREDICTOR
-- Copia y pega este script en el "SQL Editor" de tu consola de Supabase.
-- =====================================================================

-- 1. Tabla de Perfiles (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    manual_groups JSONB DEFAULT '{}'::jsonb NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Cualquiera puede leer perfiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "El usuario puede actualizar su propio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Tabla de Partidos Oficiales (matches)
CREATE TABLE IF NOT EXISTS public.matches (
    id TEXT PRIMARY KEY, -- ej: A1, A2, P1, O1, Q1, S1, final, third
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_score INTEGER NULL,
    away_score INTEGER NULL,
    winner TEXT NULL, -- Ganador real del partido (sobre todo en eliminatorias)
    status TEXT DEFAULT 'scheduled' NOT NULL CHECK (status IN ('scheduled', 'live', 'finished')),
    start_time TIMESTAMPTZ NOT NULL,
    stage TEXT NOT NULL -- group | r32 | r16 | qf | sf | third | final
);

-- Habilitar RLS en matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Políticas para matches
CREATE POLICY "Cualquiera puede leer partidos" ON public.matches
    FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden modificar partidos" ON public.matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid() AND public.profiles.is_admin = true
        )
    );

-- 3. Tabla de Predicciones de Usuarios (predictions)
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    match_id TEXT REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
    home_predicted_score INTEGER NOT NULL CHECK (home_predicted_score >= 0),
    away_predicted_score INTEGER NOT NULL CHECK (away_predicted_score >= 0),
    predicted_winner TEXT NULL, -- El equipo que el usuario predice que avanza
    points_earned INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- Habilitar RLS en predictions
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Políticas para predictions
CREATE POLICY "Cualquiera puede leer predicciones de los demas" ON public.predictions
    FOR SELECT USING (true);

-- Permite insertar o modificar si es su propia predicción y el partido no ha empezado
CREATE POLICY "El usuario puede gestionar sus predicciones antes del partido" ON public.predictions
    FOR ALL USING (
        auth.uid() = user_id
    ) WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.matches
            WHERE public.matches.id = match_id AND public.matches.start_time > NOW()
        )
    );

-- 4. Trigger para crear el perfil de usuario automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_username TEXT;
BEGIN
    -- Obtenemos el username de la metadata del usuario, o usamos la parte izquierda del correo
    v_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
    
    INSERT INTO public.profiles (id, username, is_admin)
    VALUES (
        new.id,
        v_username,
        CASE WHEN LOWER(v_username) = 'administrador' THEN true ELSE false END
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Trigger para calcular automáticamente los puntos cuando se finaliza un partido real
CREATE OR REPLACE FUNCTION public.calculate_prediction_points()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo procesar cuando el partido pasa a 'finished'
    IF NEW.status = 'finished' THEN
        UPDATE public.predictions
        SET points_earned = CASE
            -- Fase de grupos: Se puntúan goles y resultados
            WHEN NEW.stage = 'group' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
                CASE
                    -- 1. Acierto Exacto (3 puntos)
                    WHEN home_predicted_score = NEW.home_score AND away_predicted_score = NEW.away_score THEN 3
                    -- 2. Acierto de Ganador o de Empate (1 punto)
                    WHEN (home_predicted_score > away_predicted_score AND NEW.home_score > NEW.away_score) OR
                         (home_predicted_score < away_predicted_score AND NEW.home_score < NEW.away_score) OR
                         (home_predicted_score = away_predicted_score AND NEW.home_score = NEW.away_score) THEN 1
                    ELSE 0
                END
            -- Fase de eliminatorias: Se puntúa si el ganador predicho coincide con el real
            WHEN NEW.stage != 'group' AND NEW.winner IS NOT NULL THEN
                CASE
                    WHEN predicted_winner = NEW.winner THEN 1
                    ELSE 0
                END
            ELSE 0
        END
        WHERE match_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_match_finished
    AFTER UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_prediction_points();

-- 6. Vista del Leaderboard (Clasificación General de Amigos)
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    p.id AS user_id,
    p.username,
    COALESCE(SUM(pr.points_earned), 0) AS total_points,
    COUNT(pr.id) FILTER (WHERE pr.points_earned = 3) AS exact_scores,
    COUNT(pr.id) FILTER (WHERE pr.points_earned = 1) AS correct_outcomes,
    COUNT(pr.id) FILTER (WHERE pr.points_earned > 0) AS total_successes,
    COUNT(pr.id) AS total_predictions
FROM public.profiles p
LEFT JOIN public.predictions pr ON pr.user_id = p.id
GROUP BY p.id, p.username;
