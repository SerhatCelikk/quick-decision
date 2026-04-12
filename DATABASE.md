# Database Schema — Quick Decision Game

## Overview

This project uses [Supabase](https://supabase.com) (PostgreSQL) as the backend database with Row Level Security (RLS) enforced on all tables.

## Tables

### `users`

Mirrors `auth.users` for application-level user data. Populated automatically via auth trigger.

| Column       | Type        | Description                             |
|-------------|-------------|-----------------------------------------|
| `id`         | UUID (PK)   | Matches `auth.users.id`                 |
| `email`      | TEXT        | User's email (null for anonymous)       |
| `username`   | TEXT UNIQUE | Display name / handle                   |
| `avatar_url` | TEXT        | Link to avatar in `avatars` bucket      |
| `is_anonymous` | BOOLEAN   | True for anonymous/guest users          |
| `created_at` | TIMESTAMPTZ | Account creation timestamp              |
| `updated_at` | TIMESTAMPTZ | Auto-updated on changes                 |

### `categories`

Game topic categories (Science, History, etc.).

| Column        | Type        | Description                           |
|--------------|-------------|---------------------------------------|
| `id`          | UUID (PK)   | Primary key                           |
| `name`        | TEXT UNIQUE | Category name                         |
| `description` | TEXT        | Short description of the category     |
| `icon_url`    | TEXT        | Icon stored in `game-assets` bucket   |
| `is_active`   | BOOLEAN     | Whether category is available in game |
| `created_at`  | TIMESTAMPTZ | Creation timestamp                    |

### `questions`

Individual trivia questions belonging to a category.

| Column           | Type      | Description                                     |
|-----------------|-----------|-------------------------------------------------|
| `id`             | UUID (PK) | Primary key                                     |
| `category_id`    | UUID (FK) | References `categories.id`                      |
| `text`           | TEXT      | The question text                               |
| `correct_answer` | TEXT      | The correct answer                              |
| `wrong_answer`   | TEXT      | The incorrect answer (binary choice game)       |
| `difficulty`     | TEXT      | `easy`, `medium`, or `hard`                     |
| `is_active`      | BOOLEAN   | Whether question is included in gameplay        |
| `created_at`     | TIMESTAMPTZ | Creation timestamp                            |

### `levels`

Game level configuration — seeded, public read. Each row defines the difficulty parameters for one level in the 15-level curve. Replaces the original score-based tier table from CHO-19.

| Column             | Type        | Description                                          |
|-------------------|-------------|------------------------------------------------------|
| `id`               | INT (PK)    | Primary key (same value as `level_number`)           |
| `level_number`     | INT UNIQUE  | Level number (1–15+)                                 |
| `question_count`   | INT         | Number of questions presented at this level (5–15)   |
| `timer_seconds`    | INT         | Seconds allowed per question (10→4)                  |
| `difficulty_weight`| FLOAT       | Multiplier applied to question difficulty (1.0–3.0)  |
| `created_at`       | TIMESTAMPTZ | Creation timestamp                                   |

**Level curve (seeded):**

| Level | Questions | Timer (s) | Difficulty Weight |
|-------|-----------|-----------|-------------------|
| 1     | 5         | 10        | 1.00              |
| 2     | 6         | 9         | 1.14              |
| 3     | 7         | 9         | 1.29              |
| 4     | 7         | 8         | 1.43              |
| 5     | 8         | 8         | 1.57              |
| 6     | 9         | 7         | 1.71              |
| 7     | 10        | 7         | 1.86              |
| 8     | 10        | 6         | 2.00              |
| 9     | 11        | 6         | 2.14              |
| 10    | 12        | 6         | 2.29              |
| 11    | 12        | 5         | 2.43              |
| 12    | 13        | 5         | 2.57              |
| 13    | 14        | 5         | 2.71              |
| 14    | 14        | 4         | 2.86              |
| 15    | 15        | 4         | 3.00              |

### `user_progress`

One row per user. Tracks which level the user is currently on and how far they have progressed.

| Column                  | Type        | Description                                  |
|------------------------|-------------|----------------------------------------------|
| `id`                    | UUID (PK)   | Primary key                                  |
| `user_id`               | UUID (FK)   | References `auth.users.id` — unique per user |
| `current_level`         | INT         | Level the user is currently playing          |
| `highest_level_unlocked`| INT         | Highest level reached (never decreases)      |
| `created_at`            | TIMESTAMPTZ | Row creation timestamp                       |
| `updated_at`            | TIMESTAMPTZ | Auto-updated on row changes                  |

### `level_attempts`

Immutable attempt history. One row per game session submitted via `submit_level_attempt`.

| Column             | Type        | Description                                     |
|-------------------|-------------|-------------------------------------------------|
| `id`               | UUID (PK)   | Primary key                                     |
| `user_id`          | UUID (FK)   | References `auth.users.id`                      |
| `level_number`     | INT         | Which level was attempted                       |
| `questions_total`  | INT         | Questions presented in this attempt             |
| `questions_correct`| INT         | Correct answers given                           |
| `accuracy`         | FLOAT       | `questions_correct / questions_total` (0.0–1.0) |
| `passed`           | BOOLEAN     | `true` if `accuracy >= 0.75`                    |
| `attempted_at`     | TIMESTAMPTZ | When the attempt was submitted                  |

### `scores`

Immutable game session records.

| Column               | Type        | Description                             |
|---------------------|-------------|-----------------------------------------|
| `id`                 | UUID (PK)   | Primary key                             |
| `user_id`            | UUID (FK)   | References `users.id`                   |
| `session_id`         | UUID        | Groups questions within a single game   |
| `score`              | INTEGER     | Points scored in this session           |
| `streak`             | INTEGER     | Longest correct answer streak           |
| `category_id`        | UUID (FK)   | Category played (nullable for mixed)    |
| `questions_answered` | INTEGER     | Total questions answered                |
| `questions_correct`  | INTEGER     | Correct answers count                   |
| `created_at`         | TIMESTAMPTZ | Session end/record timestamp            |

---

## Row Level Security (RLS)

All tables have RLS enabled. Policies follow the principle of least privilege:

| Table        | Anonymous | Authenticated User  | Service Role |
|-------------|-----------|---------------------|--------------|
| `users`      | —         | Read own + others (username only), write own | Full access |
| `categories` | Read active | Read active       | Full access |
| `questions`  | Read active | Read active       | Full access |
| `levels`     | Read all  | Read all            | Full access |
| `scores`     | —         | Read own + all (leaderboard), insert own | Full access |

---

## Storage Buckets

### `game-assets` (public)
- Stores category icons and level badges
- Max file size: 5MB
- Accepted types: JPEG, PNG, WebP, SVG, GIF
- Write access: service role only

### `avatars` (public)
- Stores user profile avatars
- Max file size: 2MB
- Accepted types: JPEG, PNG, WebP
- Convention: `avatars/{user_id}/avatar.{ext}`
- Write access: authenticated users (own folder only)

---

## Auth Configuration

- **Email/password** sign-up enabled with email confirmation
- **Anonymous sign-in** enabled (converts to full account on email sign-up)
- JWT expiry: 1 hour (with refresh token rotation)

---

## Running Migrations Locally

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Run all migrations
supabase db push

# Load seed data
psql $(supabase db url) -f supabase/seed.sql
```

## Deploying to Production

```bash
# Link to your Supabase project
supabase link --project-ref <your-project-ref>

# Push migrations to remote
supabase db push

# Load seed data to remote
psql <your-remote-db-url> -f supabase/seed.sql
```
