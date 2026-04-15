-- ============================================================
-- Migration: 20260415000005_missing_tables.sql
-- Description: Missing tables for social, multiplayer, referral,
--              achievements, seasonal events, daily challenges,
--              share codes. Also adds RPC helpers and fixes
--              auth hook to bootstrap multiplayer_stats + user_progress.
-- ============================================================

-- ============================================================
-- SHARE_CODES TABLE
-- One shareable invite code per user (stored on users.id).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.share_codes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  code       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS share_codes_user_id_idx ON public.share_codes(user_id);
CREATE INDEX IF NOT EXISTS share_codes_code_idx    ON public.share_codes(code);

ALTER TABLE public.share_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "share_codes_select_own"
  ON public.share_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "share_codes_select_authenticated"
  ON public.share_codes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "share_codes_insert_own"
  ON public.share_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "share_codes_update_own"
  ON public.share_codes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "share_codes_service"
  ON public.share_codes FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- FRIENDSHIPS TABLE
-- Supports pending → accepted / blocked state machine.
-- Both directions (A→B and B→A) are represented as a single
-- row where user_id = requester, friend_id = recipient.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status     TEXT        NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS friendships_user_id_idx   ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_id_idx ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx    ON public.friendships(status);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- A user can see friendships where they are either party
CREATE POLICY "friendships_select_own"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Only the requester can insert
CREATE POLICY "friendships_insert_own"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Either party can update (accept / block)
CREATE POLICY "friendships_update_own"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Either party can delete (unfriend)
CREATE POLICY "friendships_delete_own"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "friendships_service"
  ON public.friendships FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- CHALLENGES TABLE
-- Player-vs-player score challenges.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenged_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status           TEXT        NOT NULL CHECK (status IN ('pending', 'accepted', 'completed', 'declined')) DEFAULT 'pending',
  challenger_score INTEGER,
  challenged_score INTEGER,
  world_id         INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS challenges_challenger_id_idx ON public.challenges(challenger_id);
CREATE INDEX IF NOT EXISTS challenges_challenged_id_idx ON public.challenges(challenged_id);
CREATE INDEX IF NOT EXISTS challenges_status_idx        ON public.challenges(status);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenges_select_own"
  ON public.challenges FOR SELECT
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "challenges_insert_own"
  ON public.challenges FOR INSERT
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "challenges_update_own"
  ON public.challenges FOR UPDATE
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "challenges_service"
  ON public.challenges FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- MULTIPLAYER_STATS TABLE
-- One row per user: ELO rating and win/loss counters.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.multiplayer_stats (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  elo        INTEGER     NOT NULL DEFAULT 1000,
  wins       INTEGER     NOT NULL DEFAULT 0,
  losses     INTEGER     NOT NULL DEFAULT 0,
  win_streak INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS multiplayer_stats_user_id_idx ON public.multiplayer_stats(user_id);
CREATE INDEX IF NOT EXISTS multiplayer_stats_elo_idx     ON public.multiplayer_stats(elo DESC);

ALTER TABLE public.multiplayer_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "multiplayer_stats_select_own"
  ON public.multiplayer_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can read others' stats for leaderboard
CREATE POLICY "multiplayer_stats_select_authenticated"
  ON public.multiplayer_stats FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "multiplayer_stats_insert_own"
  ON public.multiplayer_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "multiplayer_stats_update_own"
  ON public.multiplayer_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "multiplayer_stats_service"
  ON public.multiplayer_stats FOR ALL
  USING (auth.role() = 'service_role');

-- Auto-update updated_at
CREATE TRIGGER multiplayer_stats_updated_at
  BEFORE UPDATE ON public.multiplayer_stats
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- MULTIPLAYER_MATCHES TABLE
-- Historical match records per user.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.multiplayer_matches (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id      UUID        REFERENCES auth.users(id),
  opponent_username TEXT,
  result           TEXT        CHECK (result IN ('win', 'loss', 'draw')),
  elo_change       INTEGER     DEFAULT 0,
  my_score         INTEGER     DEFAULT 0,
  opponent_score   INTEGER     DEFAULT 0,
  completed_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS multiplayer_matches_user_id_idx      ON public.multiplayer_matches(user_id);
CREATE INDEX IF NOT EXISTS multiplayer_matches_completed_at_idx ON public.multiplayer_matches(completed_at DESC);

ALTER TABLE public.multiplayer_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "multiplayer_matches_select_own"
  ON public.multiplayer_matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "multiplayer_matches_insert_own"
  ON public.multiplayer_matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "multiplayer_matches_service"
  ON public.multiplayer_matches FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- REFERRALS TABLE
-- One row per user with their referral code and counters.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  code                 TEXT        NOT NULL UNIQUE,
  successful_referrals INTEGER     NOT NULL DEFAULT 0,
  pending_referrals    INTEGER     NOT NULL DEFAULT 0,
  coins_earned         INTEGER     NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS referrals_user_id_idx ON public.referrals(user_id);
CREATE INDEX IF NOT EXISTS referrals_code_idx    ON public.referrals(code);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_select_own"
  ON public.referrals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "referrals_select_code"
  ON public.referrals FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "referrals_insert_own"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "referrals_update_own"
  ON public.referrals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "referrals_service"
  ON public.referrals FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- USER_BADGES TABLE
-- Badge/achievement unlock records per user.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key   TEXT        NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);

CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON public.user_badges(user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_badges_select_own"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_badges_insert_own"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_badges_service"
  ON public.user_badges FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- SEASONAL_EVENT_PROGRESS TABLE
-- Per-user per-event progress tracking.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seasonal_event_progress (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_key          TEXT        NOT NULL,
  questions_answered INTEGER     NOT NULL DEFAULT 0,
  correct_answers    INTEGER     NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_key)
);

CREATE INDEX IF NOT EXISTS seasonal_event_progress_user_id_idx  ON public.seasonal_event_progress(user_id);
CREATE INDEX IF NOT EXISTS seasonal_event_progress_event_key_idx ON public.seasonal_event_progress(event_key);

ALTER TABLE public.seasonal_event_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seasonal_event_progress_select_own"
  ON public.seasonal_event_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "seasonal_event_progress_insert_own"
  ON public.seasonal_event_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seasonal_event_progress_update_own"
  ON public.seasonal_event_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "seasonal_event_progress_service"
  ON public.seasonal_event_progress FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- DAILY_CHALLENGES TABLE
-- One row per calendar date; referenced by HomeScreen banner.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  date             DATE        NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  category_id      UUID        REFERENCES public.categories(id),
  question_count   INTEGER     NOT NULL DEFAULT 10,
  bonus_multiplier FLOAT       NOT NULL DEFAULT 1.5,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS daily_challenges_date_idx ON public.daily_challenges(date DESC);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_challenges_select_authenticated"
  ON public.daily_challenges FOR SELECT
  USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "daily_challenges_service"
  ON public.daily_challenges FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- UPDATE AUTH HOOK: handle_new_user
-- Now also bootstraps multiplayer_stats + share_code + referral
-- row so every user starts with required companion rows.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
  generated_share_code TEXT;
  generated_referral_code TEXT;
BEGIN
  -- Generate default username
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'player_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8)
  );

  -- Insert into public.users
  INSERT INTO public.users (id, email, username, is_anonymous)
  VALUES (
    NEW.id,
    NEW.email,
    generated_username,
    COALESCE((NEW.raw_user_meta_data->>'is_anonymous')::BOOLEAN, NEW.is_anonymous, FALSE)
  )
  ON CONFLICT (id) DO NOTHING;

  -- Bootstrap user_progress (level 1)
  INSERT INTO public.user_progress (user_id, current_level, highest_level_unlocked)
  VALUES (NEW.id, 1, 1)
  ON CONFLICT (user_id) DO NOTHING;

  -- Bootstrap multiplayer_stats (default ELO 1000)
  INSERT INTO public.multiplayer_stats (user_id, elo, wins, losses, win_streak)
  VALUES (NEW.id, 1000, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Generate share code (6-char alphanumeric, unique)
  generated_share_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 6));
  INSERT INTO public.share_codes (user_id, code)
  VALUES (NEW.id, generated_share_code)
  ON CONFLICT (user_id) DO NOTHING;

  -- Generate referral code (8-char, different from share code)
  generated_referral_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT || 'referral') FROM 1 FOR 8));
  INSERT INTO public.referrals (user_id, code)
  VALUES (NEW.id, generated_referral_code)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RPC: send_friend_request
-- Sends a friend request by username.
-- ============================================================
CREATE OR REPLACE FUNCTION public.send_friend_request(p_friend_username TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id  UUID := auth.uid();
  v_friend_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT id INTO v_friend_id
  FROM public.users
  WHERE LOWER(username) = LOWER(p_friend_username);

  IF v_friend_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
  END IF;

  IF v_friend_id = v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'cannot_add_self');
  END IF;

  -- Check if already friends or pending
  IF EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (user_id = v_user_id AND friend_id = v_friend_id)
       OR (user_id = v_friend_id AND friend_id = v_user_id)
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_exists');
  END IF;

  INSERT INTO public.friendships (user_id, friend_id, status)
  VALUES (v_user_id, v_friend_id, 'pending');

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_friend_request(TEXT) TO authenticated;

-- ============================================================
-- RPC: accept_friend_request
-- Accepts a pending friendship where current user is friend_id.
-- ============================================================
CREATE OR REPLACE FUNCTION public.accept_friend_request(p_friendship_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  UPDATE public.friendships
  SET status = 'accepted'
  WHERE id = p_friendship_id
    AND friend_id = v_user_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'request_not_found');
  END IF;

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_friend_request(UUID) TO authenticated;

-- ============================================================
-- RPC: decline_friend_request
-- Deletes a pending friendship request.
-- ============================================================
CREATE OR REPLACE FUNCTION public.decline_friend_request(p_friendship_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  DELETE FROM public.friendships
  WHERE id = p_friendship_id
    AND (user_id = v_user_id OR friend_id = v_user_id)
    AND status = 'pending';

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.decline_friend_request(UUID) TO authenticated;

-- ============================================================
-- RPC: add_friend_by_code
-- Adds a friend using their share code.
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_friend_by_code(p_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id   UUID := auth.uid();
  v_friend_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT user_id INTO v_friend_id
  FROM public.share_codes
  WHERE UPPER(code) = UPPER(p_code);

  IF v_friend_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'code_not_found');
  END IF;

  IF v_friend_id = v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'cannot_add_self');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.friendships
    WHERE (user_id = v_user_id AND friend_id = v_friend_id)
       OR (user_id = v_friend_id AND friend_id = v_user_id)
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_exists');
  END IF;

  INSERT INTO public.friendships (user_id, friend_id, status)
  VALUES (v_user_id, v_friend_id, 'accepted');

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_friend_by_code(TEXT) TO authenticated;

-- ============================================================
-- RPC: get_leaderboard
-- Returns top N players by total score.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit INT DEFAULT 50)
RETURNS TABLE(
  rank       BIGINT,
  user_id    UUID,
  username   TEXT,
  avatar_url TEXT,
  score      BIGINT,
  level      INT
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY SUM(s.score) DESC) AS rank,
    s.user_id,
    u.username,
    u.avatar_url,
    SUM(s.score)                                   AS score,
    COALESCE(up.highest_level_unlocked, 1)         AS level
  FROM public.scores s
  JOIN public.users u ON u.id = s.user_id
  LEFT JOIN public.user_progress up ON up.user_id = s.user_id
  GROUP BY s.user_id, u.username, u.avatar_url, up.highest_level_unlocked
  ORDER BY SUM(s.score) DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.get_leaderboard(INT) TO authenticated;

-- ============================================================
-- RPC: get_user_stats
-- Returns aggregate stats for the authenticated user.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id     UUID := auth.uid();
  v_total_score BIGINT;
  v_best_streak INT;
  v_games_played INT;
  v_correct     BIGINT;
  v_total_ans   BIGINT;
  v_level       INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT
    COALESCE(SUM(score), 0),
    COALESCE(MAX(streak), 0),
    COUNT(*),
    COALESCE(SUM(questions_correct), 0),
    COALESCE(SUM(questions_answered), 0)
  INTO v_total_score, v_best_streak, v_games_played, v_correct, v_total_ans
  FROM public.scores
  WHERE user_id = v_user_id;

  SELECT COALESCE(highest_level_unlocked, 1)
  INTO v_level
  FROM public.user_progress
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'total_score',    v_total_score,
    'best_streak',    v_best_streak,
    'games_played',   v_games_played,
    'correct_answers', v_correct,
    'total_answers',  v_total_ans,
    'level',          COALESCE(v_level, 1),
    'pass_rate',      CASE
                        WHEN v_total_ans > 0
                        THEN ROUND((v_correct::FLOAT / v_total_ans * 100)::NUMERIC, 1)
                        ELSE 0
                      END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_stats() TO authenticated;

-- ============================================================
-- RPC: get_social_stats
-- Returns friend count, pending request count, and win count
-- for the authenticated user (used by SocialScreen).
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_social_stats()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id      UUID := auth.uid();
  v_friends      INT;
  v_pending      INT;
  v_wins         INT;
  v_battles      INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COUNT(*) INTO v_friends
  FROM public.friendships
  WHERE (user_id = v_user_id OR friend_id = v_user_id)
    AND status = 'accepted';

  SELECT COUNT(*) INTO v_pending
  FROM public.friendships
  WHERE friend_id = v_user_id
    AND status = 'pending';

  SELECT COALESCE(wins, 0), COALESCE(wins + losses, 0)
  INTO v_wins, v_battles
  FROM public.multiplayer_stats
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'friends', COALESCE(v_friends, 0),
    'pending', COALESCE(v_pending, 0),
    'wins',    COALESCE(v_wins, 0),
    'battles', COALESCE(v_battles, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_social_stats() TO authenticated;
