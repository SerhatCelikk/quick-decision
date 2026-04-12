-- ============================================================
-- Migration: 20260412000002_rls_policies.sql
-- Description: Row Level Security policies for all tables
-- ============================================================

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS policies
-- ============================================================

-- Users can read their own row
CREATE POLICY "users_select_own"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Public usernames are visible to all authenticated users (for leaderboards)
CREATE POLICY "users_select_public"
    ON public.users
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "users_update_own"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow insert during sign-up (service role or trigger)
CREATE POLICY "users_insert_own"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================
-- CATEGORIES policies
-- ============================================================

-- All authenticated users can read categories
CREATE POLICY "categories_select_authenticated"
    ON public.categories
    FOR SELECT
    USING (auth.role() IN ('authenticated', 'anon'));

-- Only service role can insert/update/delete categories
CREATE POLICY "categories_all_service"
    ON public.categories
    FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================
-- QUESTIONS policies
-- ============================================================

-- All authenticated (including anonymous) users can read active questions
CREATE POLICY "questions_select_active"
    ON public.questions
    FOR SELECT
    USING (
        is_active = TRUE
        AND auth.role() IN ('authenticated', 'anon')
    );

-- Only service role can manage questions
CREATE POLICY "questions_all_service"
    ON public.questions
    FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================
-- LEVELS policies
-- ============================================================

-- All users (including anonymous) can read levels
CREATE POLICY "levels_select_all"
    ON public.levels
    FOR SELECT
    USING (auth.role() IN ('authenticated', 'anon'));

-- Only service role can manage levels
CREATE POLICY "levels_all_service"
    ON public.levels
    FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================================
-- SCORES policies
-- ============================================================

-- Users can read their own scores
CREATE POLICY "scores_select_own"
    ON public.scores
    FOR SELECT
    USING (auth.uid() = user_id);

-- All authenticated users can see scores (for leaderboard)
CREATE POLICY "scores_select_leaderboard"
    ON public.scores
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Users can insert their own scores
CREATE POLICY "scores_insert_own"
    ON public.scores
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete scores (immutable game records)
-- Service role can manage all scores
CREATE POLICY "scores_all_service"
    ON public.scores
    FOR ALL
    USING (auth.role() = 'service_role');
