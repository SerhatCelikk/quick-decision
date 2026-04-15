-- ============================================================
-- Migration: 20260415000001_questions_language.sql
-- Description: Add language column to questions table for bilingual support
-- ============================================================

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'en'
  CHECK (language IN ('en', 'tr'));

CREATE INDEX IF NOT EXISTS questions_language_idx ON public.questions (language);

-- Comment for documentation
COMMENT ON COLUMN public.questions.language IS
  'Question language: ''en'' (English) or ''tr'' (Turkish). Used to serve questions matching user preference.';
