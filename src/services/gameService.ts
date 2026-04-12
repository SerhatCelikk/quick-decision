import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { Question } from '../types';
import type { QuestionRow, LevelRow } from '../types/database.types';

// ─── Cache keys ───────────────────────────────────────────────────────────────
const questionCacheKey = (categoryId: string, difficulty: string) =>
  `@questions_${categoryId}_${difficulty}`;
const PENDING_SCORES_KEY = '@pending_scores';
const PENDING_ATTEMPTS_KEY = '@pending_level_attempts';

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

// ─── User progress ────────────────────────────────────────────────────────────

export interface UserProgress {
  current_level: number;
  highest_level_unlocked: number;
}

export async function fetchUserProgress(): Promise<UserProgress | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_progress');
    if (error || !data) return null;
    return data as UserProgress;
  } catch {
    return null;
  }
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function fetchQuestionsForLevel(
  categoryId: string,
  config: LevelConfig
): Promise<Question[]> {
  const cacheKey = questionCacheKey(categoryId, config.difficulty);
  const needed = config.questionCount;

  try {
    let query = supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)
      .eq('difficulty', config.difficulty)
      .limit(needed * 3); // fetch surplus for random selection

    if (categoryId !== 'general') {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) throw new Error('No questions found');

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
): Promise<LevelAttemptResult | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    await queueAttempt(attempt);
    return null;
  }

  try {
    const { data, error } = await supabase.rpc('submit_level_attempt', {
      p_level_number: attempt.levelNumber,
      p_questions_correct: attempt.questionsCorrect,
      p_questions_total: attempt.questionsTotal,
    });

    if (error) throw error;
    return data as LevelAttemptResult;
  } catch {
    await queueAttempt(attempt);
    return null;
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
