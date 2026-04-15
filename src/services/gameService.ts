import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { Question } from '../types';
import type { QuestionRow, LevelRow } from '../types/database.types';

// ─── Cache keys ───────────────────────────────────────────────────────────────
const questionCacheKey = (categoryId: string, difficulty: string, lang: string) =>
  `@questions_${categoryId}_${difficulty}_${lang}`;
const PENDING_SCORES_KEY = '@pending_scores';
const PENDING_ATTEMPTS_KEY = '@pending_level_attempts';
// Local progress — source of truth when DB is unavailable
const LOCAL_PROGRESS_KEY = '@local_highest_level_unlocked';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapDbQuestion(row: QuestionRow): Question {
  // Randomly place correct/wrong answer so correct isn't always first
  const correctFirst = Math.random() < 0.5;
  return {
    id: row.id,
    text: row.text,
    options: correctFirst
      ? [row.correct_answer, row.wrong_answer]
      : [row.wrong_answer, row.correct_answer],
    correctIndex: correctFirst ? 0 : 1,
    categoryId: row.category_id,
    difficulty: row.difficulty,
  };
}

function difficultyForLevel(levelNumber: number): 'easy' | 'medium' | 'hard' {
  if (levelNumber <= 5) return 'easy';
  if (levelNumber <= 10) return 'medium';
  return 'hard';
}

// ─── Category resolver ────────────────────────────────────────────────────────

export async function getCategoryId(categoryName: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('categories')
      .select('id')
      .eq('name', categoryName)
      .single();
    return data?.id ?? null;
  } catch {
    return null;
  }
}

// ─── User language ────────────────────────────────────────────────────────────

async function getUserLanguage(): Promise<'en' | 'tr'> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'en';
    const { data } = await supabase
      .from('users')
      .select('preferred_language')
      .eq('id', user.id)
      .single();
    const lang = (data as { preferred_language?: string } | null)?.preferred_language;
    return (lang === 'tr' ? 'tr' : 'en');
  } catch {
    return 'en';
  }
}

// ─── Level config ─────────────────────────────────────────────────────────────

export interface LevelConfig {
  levelNumber: number;
  questionCount: number;
  timerSeconds: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const DEFAULT_LEVEL_CONFIG: LevelConfig = {
  levelNumber: 1,
  questionCount: 8,
  timerSeconds: 10,
  difficulty: 'easy',
};

export async function fetchLevelConfig(levelNumber: number): Promise<LevelConfig> {
  try {
    const { data, error } = await supabase
      .from('levels')
      .select('*')
      .eq('level_number', levelNumber)
      .single();

    if (error || !data) {
      return { ...DEFAULT_LEVEL_CONFIG, levelNumber };
    }

    const row = data as LevelRow;
    return {
      levelNumber: row.level_number,
      questionCount: row.question_count,
      timerSeconds: row.timer_seconds,
      difficulty: difficultyForLevel(row.level_number),
    };
  } catch {
    return { ...DEFAULT_LEVEL_CONFIG, levelNumber };
  }
}

// ─── Local progress helpers ──────────────────────────────────────────────────

async function getLocalHighest(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_PROGRESS_KEY);
    return raw ? Math.max(1, parseInt(raw, 10)) : 1;
  } catch {
    return 1;
  }
}

async function setLocalHighest(value: number): Promise<void> {
  try {
    const current = await getLocalHighest();
    if (value > current) {
      await AsyncStorage.setItem(LOCAL_PROGRESS_KEY, String(value));
    }
  } catch {
    // best-effort
  }
}

// ─── User progress ────────────────────────────────────────────────────────────

export interface UserProgress {
  current_level: number;
  highest_level_unlocked: number;
}

export async function fetchUserProgress(): Promise<UserProgress> {
  const localHighest = await getLocalHighest();

  try {
    const { data, error } = await supabase.rpc('get_user_progress');
    if (!error && data) {
      const dbProgress = data as UserProgress;
      // Use the higher of DB and local — they can drift if RPC was offline
      const merged: UserProgress = {
        current_level: dbProgress.current_level,
        highest_level_unlocked: Math.max(dbProgress.highest_level_unlocked, localHighest),
      };
      // Sync local up if DB is ahead
      await setLocalHighest(merged.highest_level_unlocked);
      return merged;
    }
  } catch {
    // fall through to local
  }

  // DB unavailable — return purely local progress
  return { current_level: localHighest, highest_level_unlocked: localHighest };
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function fetchQuestionsForLevel(
  categoryId: string,
  config: LevelConfig
): Promise<Question[]> {
  const lang = await getUserLanguage();
  const cacheKey = questionCacheKey(categoryId, config.difficulty, lang);
  const needed = config.questionCount;

  try {
    let query = supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .eq('difficulty', config.difficulty)
      .eq('language', lang)
      .limit(needed * 3); // fetch surplus for random selection

    if (categoryId !== 'general') {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    // If language-specific query returns nothing, fall back without language filter
    if (error || !data || data.length === 0) {
      let fallbackQuery = supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .eq('difficulty', config.difficulty)
        .limit(needed * 3);

      if (categoryId !== 'general') {
        fallbackQuery = fallbackQuery.eq('category_id', categoryId);
      }

      const { data: fallbackData, error: fallbackError } = await fallbackQuery;
      if (fallbackError) throw fallbackError;
      if (!fallbackData || fallbackData.length === 0) throw new Error('No questions found');

      const rows = (fallbackData as QuestionRow[])
        .sort(() => Math.random() - 0.5)
        .slice(0, needed);

      const questions = rows.map(mapDbQuestion);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(questions)).catch(() => null);
      return questions;
    }

    // Shuffle and take what we need
    const rows = (data as QuestionRow[])
      .sort(() => Math.random() - 0.5)
      .slice(0, needed);

    const questions = rows.map(mapDbQuestion);

    // Cache for offline fallback
    await AsyncStorage.setItem(cacheKey, JSON.stringify(questions)).catch(() => null);

    return questions;
  } catch (networkErr) {
    // Offline fallback — return cached questions if available
    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (raw) {
        const cached: Question[] = JSON.parse(raw);
        return cached.sort(() => Math.random() - 0.5).slice(0, needed);
      }
    } catch {
      // ignore cache errors
    }
    throw networkErr;
  }
}

// ─── Score submission ─────────────────────────────────────────────────────────

export interface ScorePayload {
  score: number;
  streak: number;
  categoryId: string | null;
  questionsAnswered: number;
  questionsCorrect: number;
}

export async function submitScore(payload: ScorePayload): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await queueScore(payload);
    return;
  }

  const { error } = await supabase.from('scores').insert({
    user_id: user.id,
    score: payload.score,
    streak: payload.streak,
    category_id: payload.categoryId,
    questions_answered: payload.questionsAnswered,
    questions_correct: payload.questionsCorrect,
  });

  if (error) {
    await queueScore(payload);
  }
}

async function queueScore(payload: ScorePayload) {
  try {
    const raw = await AsyncStorage.getItem(PENDING_SCORES_KEY);
    const queue: ScorePayload[] = raw ? JSON.parse(raw) : [];
    queue.push(payload);
    await AsyncStorage.setItem(PENDING_SCORES_KEY, JSON.stringify(queue));
  } catch {
    // best-effort
  }
}

// ─── Level attempt ────────────────────────────────────────────────────────────

export interface LevelAttemptPayload {
  levelNumber: number;
  questionsCorrect: number;
  questionsTotal: number;
}

export interface LevelAttemptResult {
  passed: boolean;
  accuracy: number;
  next_level: number;
}

export async function submitLevelAttempt(
  attempt: LevelAttemptPayload
): Promise<LevelAttemptResult> {
  const accuracy = attempt.questionsTotal > 0
    ? attempt.questionsCorrect / attempt.questionsTotal
    : 0;
  const passed = accuracy >= 0.75;
  const nextLevel = passed ? attempt.levelNumber + 1 : attempt.levelNumber;

  // Always update local progress immediately — this is the unlock source of truth
  if (passed) {
    await setLocalHighest(nextLevel);
  }

  // Build a local result so the caller always gets a valid response
  const localResult: LevelAttemptResult = { passed, accuracy, next_level: nextLevel };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await queueAttempt(attempt);
    return localResult;
  }

  try {
    const { data, error } = await supabase.rpc('submit_level_attempt', {
      p_level_number: attempt.levelNumber,
      p_questions_correct: attempt.questionsCorrect,
      p_questions_total: attempt.questionsTotal,
    });

    if (error) throw error;
    const dbResult = data as LevelAttemptResult;
    // Sync local with DB result (DB might have a higher value from another device)
    if (dbResult.passed) await setLocalHighest(dbResult.next_level);
    return dbResult;
  } catch {
    await queueAttempt(attempt);
    return localResult;
  }
}

async function queueAttempt(attempt: LevelAttemptPayload) {
  try {
    const raw = await AsyncStorage.getItem(PENDING_ATTEMPTS_KEY);
    const queue: LevelAttemptPayload[] = raw ? JSON.parse(raw) : [];
    queue.push(attempt);
    await AsyncStorage.setItem(PENDING_ATTEMPTS_KEY, JSON.stringify(queue));
  } catch {
    // best-effort
  }
}

// ─── Flush queued submissions (call on app resume / auth) ────────────────────

export async function flushPendingSubmissions(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Flush scores
  try {
    const raw = await AsyncStorage.getItem(PENDING_SCORES_KEY);
    if (raw) {
      const queue: ScorePayload[] = JSON.parse(raw);
      for (const s of queue) {
        await supabase.from('scores').insert({
          user_id: user.id,
          score: s.score,
          streak: s.streak,
          category_id: s.categoryId,
          questions_answered: s.questionsAnswered,
          questions_correct: s.questionsCorrect,
        });
      }
      await AsyncStorage.removeItem(PENDING_SCORES_KEY);
    }
  } catch {
    // leave in queue for next flush
  }

  // Flush level attempts
  try {
    const raw = await AsyncStorage.getItem(PENDING_ATTEMPTS_KEY);
    if (raw) {
      const queue: LevelAttemptPayload[] = JSON.parse(raw);
      for (const a of queue) {
        await supabase.rpc('submit_level_attempt', {
          p_level_number: a.levelNumber,
          p_questions_correct: a.questionsCorrect,
          p_questions_total: a.questionsTotal,
        });
      }
      await AsyncStorage.removeItem(PENDING_ATTEMPTS_KEY);
    }
  } catch {
    // leave in queue
  }
}
