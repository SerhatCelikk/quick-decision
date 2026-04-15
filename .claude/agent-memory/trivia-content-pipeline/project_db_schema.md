---
name: Database Schema Details
description: Supabase questions table schema, categories, and seed file conventions for Quick Decision trivia game
type: project
---

## Questions Table Schema
- Table: `public.questions`
- Columns: id (UUID), category_id (UUID FK), text, correct_answer, wrong_answer, difficulty (easy/medium/hard), language (en/tr), is_active, created_at
- Language column added via migration `20260415000001_questions_language.sql`
- Binary choice game: exactly ONE wrong answer per question

## Categories (exact names in DB)
Animals, Science, History, Geography, Sports, Pop Culture, Technology, Food

## Seed File Convention
- Uses `SELECT c.id ... FROM public.categories c, (VALUES ...) AS q(...) WHERE c.name = 'CategoryName'`
- Seed file: `supabase/seed_questions.sql`
- Existing basic seed: `supabase/seed.sql` (levels, categories, sample questions without language column)

**Why:** Content pipeline needs exact schema match to insert questions correctly.
**How to apply:** Always use this schema when generating new question batches. Language column is required.
