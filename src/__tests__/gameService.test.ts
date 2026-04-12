/**
 * Tests for gameService.ts — covers offline cache fallback, queue behaviour,
 * level attempt submission, and score submission.
 */

// All mock variables must be defined INSIDE the factory (jest.mock is hoisted above const declarations)
jest.mock('../services/supabase', () => {
  const mockGetUser = jest.fn();
  const mockInsert = jest.fn();
  const mockLimit = jest.fn();
  const mockEq = jest.fn();
  const mockSelect = jest.fn();
  const mockFrom = jest.fn();
  const mockRpc = jest.fn();

  // Chain builders
  mockSelect.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue({ eq: mockEq, limit: mockLimit });
  mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });

  return {
    supabase: {
      auth: { getUser: mockGetUser },
      from: mockFrom,
      rpc: mockRpc,
      _mocks: { mockGetUser, mockInsert, mockLimit, mockEq, mockSelect, mockFrom, mockRpc },
    },
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import {
  fetchQuestionsForLevel,
  submitLevelAttempt,
  fetchUserProgress,
  submitScore,
  flushPendingSubmissions,
  type LevelConfig,
} from '../services/gameService';

// Pull out the mock helpers from the supabase mock object
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mocks = (supabase as any)._mocks as {
  mockGetUser: jest.Mock;
  mockInsert: jest.Mock;
  mockLimit: jest.Mock;
  mockEq: jest.Mock;
  mockSelect: jest.Mock;
  mockFrom: jest.Mock;
  mockRpc: jest.Mock;
};

// Helper to build a mock level config
const buildLevelConfig = (overrides?: Partial<LevelConfig>): LevelConfig => ({
  levelNumber: 1,
  questionCount: 5,
  timerSeconds: 10,
  difficulty: 'easy',
  ...overrides,
});

// Helper to build a mock DB question row
const buildDbQuestion = (id = 'q1') => ({
  id,
  text: `Question ${id}`,
  correct_answer: 'Correct',
  wrong_answer: 'Wrong',
  category_id: 'general',
  difficulty: 'easy',
  is_active: true,
});

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();

  // Restore default chaining after clearAllMocks resets return values
  mocks.mockSelect.mockReturnValue({ eq: mocks.mockEq });
  mocks.mockEq.mockReturnValue({ eq: mocks.mockEq, limit: mocks.mockLimit });
  mocks.mockFrom.mockReturnValue({ select: mocks.mockSelect, insert: mocks.mockInsert });
});

// ─── fetchQuestionsForLevel ───────────────────────────────────────────────────

describe('fetchQuestionsForLevel', () => {
  it('returns mapped questions from Supabase on success', async () => {
    const rows = [
      buildDbQuestion('q1'), buildDbQuestion('q2'), buildDbQuestion('q3'),
      buildDbQuestion('q4'), buildDbQuestion('q5'),
    ];
    mocks.mockLimit.mockResolvedValue({ data: rows, error: null });

    const config = buildLevelConfig({ questionCount: 5 });
    const result = await fetchQuestionsForLevel('general', config);

    expect(result).toHaveLength(5);
    for (const q of result) {
      expect([0, 1]).toContain(q.correctIndex);
      expect(q.options[q.correctIndex]).toBe('Correct');
      expect(q.options[1 - q.correctIndex]).toBe('Wrong');
    }
  });

  it('returns cached questions when Supabase throws', async () => {
    const cachedQuestions = [
      { id: 'c1', text: 'Cached Q', options: ['A', 'B'], correctIndex: 0,
        categoryId: 'general', difficulty: 'easy' },
    ];
    const cacheKey = '@questions_general_easy';
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cachedQuestions));

    mocks.mockLimit.mockRejectedValue(new Error('Network error'));

    const config = buildLevelConfig({ questionCount: 1 });
    const result = await fetchQuestionsForLevel('general', config);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
  });

  it('throws when Supabase fails and no cache exists', async () => {
    mocks.mockLimit.mockRejectedValue(new Error('Network error'));

    const config = buildLevelConfig();
    await expect(fetchQuestionsForLevel('general', config)).rejects.toThrow('Network error');
  });

  it('throws when Supabase returns empty data', async () => {
    mocks.mockLimit.mockResolvedValue({ data: [], error: null });

    const config = buildLevelConfig();
    await expect(fetchQuestionsForLevel('general', config)).rejects.toThrow('No questions found');
  });

  it('caches questions for offline use after successful fetch', async () => {
    const rows = Array.from({ length: 5 }, (_, i) => buildDbQuestion(`q${i}`));
    mocks.mockLimit.mockResolvedValue({ data: rows, error: null });

    const config = buildLevelConfig({ questionCount: 5 });
    await fetchQuestionsForLevel('general', config);

    const cacheKey = '@questions_general_easy';
    const cached = await AsyncStorage.getItem(cacheKey);
    expect(cached).not.toBeNull();
    const parsed = JSON.parse(cached!);
    expect(parsed).toHaveLength(5);
  });

  it('maps questions so correctIndex always points to "Correct" option', async () => {
    // Run many times to cover both randomized orderings
    const rows = Array.from({ length: 20 }, (_, i) => buildDbQuestion(`q${i}`));
    mocks.mockLimit.mockResolvedValue({ data: rows, error: null });

    const config = buildLevelConfig({ questionCount: 20 });
    const result = await fetchQuestionsForLevel('general', config);

    for (const q of result) {
      expect(q.options[q.correctIndex]).toBe('Correct');
    }
  });
});

// ─── fetchUserProgress ────────────────────────────────────────────────────────

describe('fetchUserProgress', () => {
  it('returns progress data from RPC on success', async () => {
    const progress = { current_level: 3, highest_level_unlocked: 5 };
    mocks.mockRpc.mockResolvedValue({ data: progress, error: null });

    const result = await fetchUserProgress();
    expect(result).toEqual(progress);
    expect(mocks.mockRpc).toHaveBeenCalledWith('get_user_progress');
  });

  it('returns null when RPC fails', async () => {
    mocks.mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC error' } });
    const result = await fetchUserProgress();
    expect(result).toBeNull();
  });

  it('returns null when RPC throws', async () => {
    mocks.mockRpc.mockRejectedValue(new Error('Network'));
    const result = await fetchUserProgress();
    expect(result).toBeNull();
  });
});

// ─── submitLevelAttempt ───────────────────────────────────────────────────────

describe('submitLevelAttempt', () => {
  const attempt = { levelNumber: 1, questionsCorrect: 6, questionsTotal: 8 };

  it('calls submit_level_attempt RPC when user is logged in', async () => {
    mocks.mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const rpcResult = { passed: true, accuracy: 0.75, next_level: 2 };
    mocks.mockRpc.mockResolvedValue({ data: rpcResult, error: null });

    const result = await submitLevelAttempt(attempt);

    expect(mocks.mockRpc).toHaveBeenCalledWith('submit_level_attempt', {
      p_level_number: 1,
      p_questions_correct: 6,
      p_questions_total: 8,
    });
    expect(result).toEqual(rpcResult);
  });

  it('queues attempt and returns null when user is not logged in', async () => {
    mocks.mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await submitLevelAttempt(attempt);

    expect(result).toBeNull();
    const raw = await AsyncStorage.getItem('@pending_level_attempts');
    const queue = JSON.parse(raw!);
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject(attempt);
  });

  it('queues attempt and returns null when RPC throws', async () => {
    mocks.mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.mockRpc.mockRejectedValue(new Error('Network'));

    const result = await submitLevelAttempt(attempt);

    expect(result).toBeNull();
    const raw = await AsyncStorage.getItem('@pending_level_attempts');
    const queue = JSON.parse(raw!);
    expect(queue).toHaveLength(1);
  });

  it('accumulates multiple queued attempts', async () => {
    mocks.mockGetUser.mockResolvedValue({ data: { user: null } });

    await submitLevelAttempt({ levelNumber: 1, questionsCorrect: 5, questionsTotal: 8 });
    await submitLevelAttempt({ levelNumber: 2, questionsCorrect: 7, questionsTotal: 8 });

    const raw = await AsyncStorage.getItem('@pending_level_attempts');
    const queue = JSON.parse(raw!);
    expect(queue).toHaveLength(2);
    expect(queue[0].levelNumber).toBe(1);
    expect(queue[1].levelNumber).toBe(2);
  });
});

// ─── submitScore ──────────────────────────────────────────────────────────────

describe('submitScore', () => {
  const scorePayload = {
    score: 500,
    streak: 3,
    categoryId: 'general',
    questionsAnswered: 8,
    questionsCorrect: 6,
  };

  it('inserts score when user is logged in', async () => {
    mocks.mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.mockInsert.mockResolvedValue({ error: null });

    await submitScore(scorePayload);

    expect(mocks.mockFrom).toHaveBeenCalledWith('scores');
    expect(mocks.mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ score: 500, streak: 3 })
    );
  });

  it('queues score when user is not logged in', async () => {
    mocks.mockGetUser.mockResolvedValue({ data: { user: null } });

    await submitScore(scorePayload);

    const raw = await AsyncStorage.getItem('@pending_scores');
    const queue = JSON.parse(raw!);
    expect(queue).toHaveLength(1);
    expect(queue[0].score).toBe(500);
  });

  it('queues score when insert fails', async () => {
    mocks.mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.mockInsert.mockResolvedValue({ error: { message: 'DB error' } });

    await submitScore(scorePayload);

    const raw = await AsyncStorage.getItem('@pending_scores');
    const queue = JSON.parse(raw!);
    expect(queue).toHaveLength(1);
  });
});

// ─── flushPendingSubmissions ──────────────────────────────────────────────────

describe('flushPendingSubmissions', () => {
  it('does nothing when user is not logged in', async () => {
    mocks.mockGetUser.mockResolvedValue({ data: { user: null } });

    await AsyncStorage.setItem(
      '@pending_level_attempts',
      JSON.stringify([{ levelNumber: 1, questionsCorrect: 5, questionsTotal: 8 }])
    );

    await flushPendingSubmissions();

    // Queue should still be there since user not logged in
    const raw = await AsyncStorage.getItem('@pending_level_attempts');
    expect(raw).not.toBeNull();
  });

  it('flushes queued attempts when user logs in', async () => {
    mocks.mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.mockRpc.mockResolvedValue({ data: { passed: true }, error: null });

    await AsyncStorage.setItem(
      '@pending_level_attempts',
      JSON.stringify([
        { levelNumber: 1, questionsCorrect: 6, questionsTotal: 8 },
        { levelNumber: 2, questionsCorrect: 7, questionsTotal: 8 },
      ])
    );
    await AsyncStorage.removeItem('@pending_scores');

    await flushPendingSubmissions();

    expect(mocks.mockRpc).toHaveBeenCalledWith('submit_level_attempt', expect.objectContaining({
      p_level_number: 1,
    }));
    expect(mocks.mockRpc).toHaveBeenCalledWith('submit_level_attempt', expect.objectContaining({
      p_level_number: 2,
    }));

    const raw = await AsyncStorage.getItem('@pending_level_attempts');
    expect(raw).toBeNull();
  });

  it('flushes queued scores when user logs in', async () => {
    mocks.mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.mockInsert.mockResolvedValue({ error: null });

    await AsyncStorage.setItem(
      '@pending_scores',
      JSON.stringify([
        { score: 300, streak: 2, categoryId: 'general', questionsAnswered: 5, questionsCorrect: 4 },
      ])
    );
    await AsyncStorage.removeItem('@pending_level_attempts');

    await flushPendingSubmissions();

    expect(mocks.mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ score: 300, user_id: 'user-1' })
    );
    const raw = await AsyncStorage.getItem('@pending_scores');
    expect(raw).toBeNull();
  });
});
