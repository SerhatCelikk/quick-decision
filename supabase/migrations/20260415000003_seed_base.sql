-- ============================================================
-- Seed Data: Quick Decision Game
-- Description: Initial seed data for categories, questions, and levels
-- ============================================================

-- ============================================================
-- LEVELS (game level configuration: 15-level curve)
-- question_count: 5 → 15, timer_seconds: 10 → 4,
-- difficulty_weight: 1.0 → 3.0
-- ============================================================
INSERT INTO public.levels (id, level_number, question_count, timer_seconds, difficulty_weight) VALUES
    (1,  1,  5,  10, 1.00),
    (2,  2,  6,   9, 1.14),
    (3,  3,  7,   9, 1.29),
    (4,  4,  7,   8, 1.43),
    (5,  5,  8,   8, 1.57),
    (6,  6,  9,   7, 1.71),
    (7,  7, 10,   7, 1.86),
    (8,  8, 10,   6, 2.00),
    (9,  9, 11,   6, 2.14),
    (10, 10, 12,  6, 2.29),
    (11, 11, 12,  5, 2.43),
    (12, 12, 13,  5, 2.57),
    (13, 13, 14,  5, 2.71),
    (14, 14, 14,  4, 2.86),
    (15, 15, 15,  4, 3.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO public.categories (name, description) VALUES
    ('Science',     'Questions about physics, chemistry, biology, and more'),
    ('History',     'Test your knowledge of world history'),
    ('Geography',   'Countries, capitals, landmarks, and maps'),
    ('Sports',      'Sports trivia and athletic achievements'),
    ('Pop Culture', 'Movies, music, TV, and celebrity trivia'),
    ('Technology',  'Computers, programming, and tech innovations'),
    ('Food',        'Cuisine, ingredients, and culinary facts'),
    ('Animals',     'Wildlife, pets, and animal kingdom facts')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SAMPLE QUESTIONS (Science)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty)
SELECT
    c.id,
    q.text,
    q.correct_answer,
    q.wrong_answer,
    q.difficulty
FROM public.categories c, (VALUES
    ('What is the chemical symbol for Gold?', 'Au', 'Ag', 'easy'),
    ('How many bones does an adult human body have?', '206', '208', 'medium'),
    ('What is the speed of light in a vacuum (approximately)?', '299,792,458 m/s', '199,792,458 m/s', 'hard'),
    ('What planet is known as the Red Planet?', 'Mars', 'Venus', 'easy'),
    ('What is the powerhouse of the cell?', 'Mitochondria', 'Nucleus', 'easy')
) AS q(text, correct_answer, wrong_answer, difficulty)
WHERE c.name = 'Science'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SAMPLE QUESTIONS (History)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty)
SELECT
    c.id,
    q.text,
    q.correct_answer,
    q.wrong_answer,
    q.difficulty
FROM public.categories c, (VALUES
    ('In what year did World War II end?', '1945', '1944', 'easy'),
    ('Who was the first President of the United States?', 'George Washington', 'John Adams', 'easy'),
    ('What ancient wonder was located in Alexandria, Egypt?', 'The Lighthouse', 'The Colossus', 'medium'),
    ('In what year did the Berlin Wall fall?', '1989', '1991', 'medium'),
    ('Who wrote the Magna Carta?', 'King John sealed it', 'King Henry II', 'hard')
) AS q(text, correct_answer, wrong_answer, difficulty)
WHERE c.name = 'History'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SAMPLE QUESTIONS (Geography)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty)
SELECT
    c.id,
    q.text,
    q.correct_answer,
    q.wrong_answer,
    q.difficulty
FROM public.categories c, (VALUES
    ('What is the capital of Australia?', 'Canberra', 'Sydney', 'medium'),
    ('Which is the largest country by area?', 'Russia', 'Canada', 'easy'),
    ('What is the longest river in the world?', 'Nile', 'Amazon', 'medium'),
    ('How many countries are in Africa?', '54', '52', 'hard'),
    ('What is the smallest country in the world?', 'Vatican City', 'Monaco', 'easy')
) AS q(text, correct_answer, wrong_answer, difficulty)
WHERE c.name = 'Geography'
ON CONFLICT DO NOTHING;
