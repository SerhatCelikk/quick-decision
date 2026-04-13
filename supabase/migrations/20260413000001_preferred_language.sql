-- Migration: add preferred_language to users table for cross-device language sync
-- Run this in the Supabase SQL editor for project uibbdxtbdsrsagymgwuv

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en'
  CHECK (preferred_language IN ('en', 'tr'));

-- Back-fill any existing rows that might have NULL
UPDATE public.users
  SET preferred_language = 'en'
  WHERE preferred_language IS NULL;

-- Comment for documentation
COMMENT ON COLUMN public.users.preferred_language IS
  'User UI language preference: ''en'' (English) or ''tr'' (Turkish). Synced cross-device via app.';
