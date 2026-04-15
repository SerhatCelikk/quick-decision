-- ============================================================
-- Migration: 20260412000005_level_progression.sql
-- Description: Level progression system (idempotent)
-- ============================================================

DROP TABLE IF EXISTS public.levels CASCADE;

-- ============================================================
-- LEVELS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.levels (
    id                INT         PRIMARY KEY,
    level_number      INT         UNIQUE NOT NULL,
    question_count    INT         NOT NULL,
    timer_seconds     INT         NOT NULL,
    difficulty_weight FLOAT       NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER_PROGRESS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
    id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_level          INT         NOT NULL DEFAULT 1,
    highest_level_unlocked INT         NOT NULL DEFAULT 1,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

DROP TRIGGER IF EXISTS user_progress_updated_at ON public.user_progress;
CREATE TRIGGER user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS user_progress_user_id_idx ON public.user_progress(user_id);

-- ============================================================
-- LEVEL_ATTEMPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.level_attempts (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    level_number      INT         NOT NULL,
    questions_total   INT         NOT NULL,
    questions_correct INT         NOT NULL,
    accuracy          FLOAT       NOT NULL,
    passed            BOOLEAN     NOT NULL,
    attempted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS level_attempts_user_id_idx    ON public.level_attempts(user_id);
CREATE INDEX IF NOT EXISTS level_attempts_level_idx      ON public.level_attempts(level_number);
CREATE INDEX IF NOT EXISTS level_attempts_user_level_idx ON public.level_attempts(user_id, level_number);

-- ============================================================
-- RLS: LEVELS
-- ============================================================
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "levels_select_public" ON public.levels;
DROP POLICY IF EXISTS "levels_all_service"   ON public.levels;

CREATE POLICY "levels_select_public" ON public.levels FOR SELECT USING (true);
CREATE POLICY "levels_all_service"   ON public.levels FOR ALL   USING (auth.role() = 'service_role');

-- ============================================================
-- RLS: USER_PROGRESS
-- ============================================================
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_progress_select_own" ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_insert_own" ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_update_own" ON public.user_progress;
DROP POLICY IF EXISTS "user_progress_delete_own" ON public.user_progress;

CREATE POLICY "user_progress_select_own" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_progress_insert_own" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_progress_update_own" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_progress_delete_own" ON public.user_progress FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RLS: LEVEL_ATTEMPTS
-- ============================================================
ALTER TABLE public.level_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "level_attempts_select_own"  ON public.level_attempts;
DROP POLICY IF EXISTS "level_attempts_insert_own"  ON public.level_attempts;
DROP POLICY IF EXISTS "level_attempts_all_service" ON public.level_attempts;

CREATE POLICY "level_attempts_select_own"  ON public.level_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "level_attempts_insert_own"  ON public.level_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "level_attempts_all_service" ON public.level_attempts FOR ALL   USING (auth.role() = 'service_role');

-- ============================================================
-- RPC: submit_level_attempt
-- ============================================================
CREATE OR REPLACE FUNCTION public.submit_level_attempt(
    p_level_number      INT,
    p_questions_correct INT,
    p_questions_total   INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id    UUID;
    v_accuracy   FLOAT;
    v_passed     BOOLEAN;
    v_next_level INT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF p_questions_total <= 0 THEN
        RAISE EXCEPTION 'questions_total must be greater than 0';
    END IF;

    IF p_questions_correct < 0 OR p_questions_correct > p_questions_total THEN
        RAISE EXCEPTION 'questions_correct must be between 0 and questions_total';
    END IF;

    v_accuracy := p_questions_correct::FLOAT / p_questions_total;
    v_passed   := v_accuracy >= 0.75;

    INSERT INTO public.level_attempts (
        user_id, level_number, questions_total, questions_correct, accuracy, passed
    ) VALUES (
        v_user_id, p_level_number, p_questions_total, p_questions_correct, v_accuracy, v_passed
    );

    IF v_passed THEN
        INSERT INTO public.user_progress (
            user_id, current_level, highest_level_unlocked
        ) VALUES (
            v_user_id, p_level_number, p_level_number + 1
        )
        ON CONFLICT (user_id) DO UPDATE
            SET highest_level_unlocked = GREATEST(
                    user_progress.highest_level_unlocked,
                    p_level_number + 1
                ),
                current_level = GREATEST(user_progress.current_level, p_level_number),
                updated_at = NOW();

        SELECT highest_level_unlocked
        INTO   v_next_level
        FROM   public.user_progress
        WHERE  user_id = v_user_id;
    ELSE
        v_next_level := p_level_number;
    END IF;

    RETURN jsonb_build_object(
        'passed',     v_passed,
        'accuracy',   v_accuracy,
        'next_level', v_next_level
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_level_attempt(INT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_level_attempt(INT, INT, INT) TO anon;

-- ============================================================
-- RPC: get_user_progress
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_progress()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_current INT;
    v_highest INT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT current_level, highest_level_unlocked
    INTO   v_current, v_highest
    FROM   public.user_progress
    WHERE  user_id = v_user_id;

    RETURN jsonb_build_object(
        'current_level',          COALESCE(v_current, 1),
        'highest_level_unlocked', COALESCE(v_highest, 1)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_progress() TO anon;
