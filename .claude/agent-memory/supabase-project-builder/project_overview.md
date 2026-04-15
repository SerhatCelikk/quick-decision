---
name: Project Overview
description: Expo React Native trivia game with Supabase backend
type: project
---

Expo React Native trivia game called "Quick Decision". Supabase project ref: nhdpikwzhklqyosxrrmh.

**Tech Stack:**
- Frontend: Expo React Native + TypeScript
- Backend: Supabase (PostgreSQL, Edge Functions planned, RLS, Auth)
- Design: Pixel Festival v7 — indigo #4338CA background, yellow #FDE047 primary, glass cards
- i18n: TR/EN via src/i18n/index.ts (single file with translations object)

**Why:** Production game app, needs real Supabase backend without VPS.

**How to apply:** All backend logic must be serverless (Supabase Edge Functions or DB functions). Never use VPS.
