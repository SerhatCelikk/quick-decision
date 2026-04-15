---
name: DB Schema
description: All Supabase tables, their columns, and migration history
type: project
---

## Migration History (in order)
1. 20260412000001_initial_schema.sql — users, categories, questions, scores, levels
2. 20260412000002_rls_policies.sql — RLS on all initial tables
3. 20260412000003_auth_hooks.sql — handle_new_user() trigger on auth.users insert
4. 20260412000004_storage.sql — storage bucket
5. 20260412000005_level_progression.sql — levels (int PK), user_progress, level_attempts, submit_level_attempt RPC, get_user_progress RPC
6. 20260413000001_preferred_language.sql — users.preferred_language column ('en'|'tr')
7. 20260415000001_questions_language.sql — questions.language column
8. 20260415000002_more_levels.sql — level 16-60 configs
9. 20260415000003_seed_base.sql — categories + base questions seed
10. 20260415000004_seed_questions.sql — 600 EN+TR questions
11. 20260415000005_missing_tables.sql — share_codes, friendships, challenges, multiplayer_stats, multiplayer_matches, referrals, user_badges, seasonal_event_progress, daily_challenges + RPCs + auth hook update

## Key Tables
- **users**: id, email, username, avatar_url, is_anonymous, preferred_language, created_at, updated_at
- **scores**: id, user_id, session_id, score, streak, category_id, questions_answered, questions_correct, created_at
- **user_progress**: id, user_id, current_level, highest_level_unlocked (UNIQUE on user_id)
- **level_attempts**: id, user_id, level_number, questions_total, questions_correct, accuracy, passed
- **friendships**: id, user_id, friend_id, status ('pending'|'accepted'|'blocked'), created_at — UNIQUE(user_id, friend_id)
- **challenges**: id, challenger_id, challenged_id, status ('pending'|'accepted'|'completed'|'declined'), challenger_score, challenged_score, world_id, created_at, completed_at
- **multiplayer_stats**: id, user_id (UNIQUE), elo (default 1000), wins, losses, win_streak
- **multiplayer_matches**: id, user_id, opponent_id, opponent_username, result, elo_change, my_score, opponent_score, completed_at
- **referrals**: id, user_id (UNIQUE), code (UNIQUE), successful_referrals, pending_referrals, coins_earned
- **user_badges**: id, user_id, badge_key, unlocked_at — UNIQUE(user_id, badge_key)
- **seasonal_event_progress**: id, user_id, event_key, questions_answered, correct_answers, updated_at — UNIQUE(user_id, event_key)
- **daily_challenges**: id, date (UNIQUE), category_id, question_count, bonus_multiplier
- **share_codes**: id, user_id (UNIQUE), code (UNIQUE)

## Auth Hook (handle_new_user)
On sign-up, automatically creates rows in:
- public.users
- public.user_progress (level 1)
- public.multiplayer_stats (ELO 1000)
- public.share_codes (6-char MD5 code)
- public.referrals (8-char MD5 code)

## Available RPCs (all require authenticated role)
- submit_level_attempt(p_level_number, p_questions_correct, p_questions_total) → {passed, accuracy, next_level}
- get_user_progress() → {current_level, highest_level_unlocked}
- get_user_stats() → {total_score, best_streak, games_played, correct_answers, total_answers, level, pass_rate}
- get_leaderboard(p_limit) → [{rank, user_id, username, avatar_url, score, level}]
- get_social_stats() → {friends, pending, wins, battles}
- send_friend_request(p_friend_username) → {success, error?}
- accept_friend_request(p_friendship_id) → {success, error?}
- decline_friend_request(p_friendship_id) → {success, error?}
- add_friend_by_code(p_code) → {success, error?}
