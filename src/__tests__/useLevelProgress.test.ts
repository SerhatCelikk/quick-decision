/**
 * Tests for useLevelProgress hook.
 */

// Mock before imports to avoid hoisting issues
jest.mock('../services/gameService', () => ({
  fetchUserProgress: jest.fn(),
  submitLevelAttempt: jest.fn(),
}));

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLevelProgress } from '../hooks/useLevelProgress';
import { fetchUserProgress, submitLevelAttempt } from '../services/gameService';

const mockFetchUserProgress = fetchUserProgress as jest.Mock;
const mockSubmitLevelAttempt = submitLevelAttempt as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useLevelProgress', () => {
  it('starts loading and then returns progress', async () => {
    const progress = { current_level: 3, highest_level_unlocked: 5 };
    mockFetchUserProgress.mockResolvedValue(progress);

    const { result } = renderHook(() => useLevelProgress());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.progress).toEqual(progress);
  });

  it('returns null progress when fetchUserProgress returns null', async () => {
    mockFetchUserProgress.mockResolvedValue(null);

    const { result } = renderHook(() => useLevelProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.progress).toBeNull();
  });

  it('submitAttempt calls submitLevelAttempt and refreshes progress', async () => {
    const initialProgress = { current_level: 1, highest_level_unlocked: 1 };
    const updatedProgress = { current_level: 2, highest_level_unlocked: 2 };
    const attemptResult = { passed: true, accuracy: 0.875, next_level: 2 };

    mockFetchUserProgress
      .mockResolvedValueOnce(initialProgress)
      .mockResolvedValueOnce(updatedProgress);
    mockSubmitLevelAttempt.mockResolvedValue(attemptResult);

    const { result } = renderHook(() => useLevelProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let returned: unknown;
    await act(async () => {
      returned = await result.current.submitAttempt(1, 7, 8);
    });

    expect(mockSubmitLevelAttempt).toHaveBeenCalledWith({
      levelNumber: 1,
      questionsCorrect: 7,
      questionsTotal: 8,
    });
    expect(returned).toEqual(attemptResult);
    expect(result.current.progress).toEqual(updatedProgress);
  });

  it('submitAttempt does not refresh when result is null', async () => {
    const initialProgress = { current_level: 1, highest_level_unlocked: 1 };
    mockFetchUserProgress.mockResolvedValue(initialProgress);
    mockSubmitLevelAttempt.mockResolvedValue(null);

    const { result } = renderHook(() => useLevelProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.submitAttempt(1, 3, 8);
    });

    // fetchUserProgress called only once (on mount), not again after null result
    expect(mockFetchUserProgress).toHaveBeenCalledTimes(1);
  });

  it('refresh() reloads progress', async () => {
    const progress1 = { current_level: 1, highest_level_unlocked: 1 };
    const progress2 = { current_level: 3, highest_level_unlocked: 4 };
    mockFetchUserProgress
      .mockResolvedValueOnce(progress1)
      .mockResolvedValueOnce(progress2);

    const { result } = renderHook(() => useLevelProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.progress).toEqual(progress1);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.progress).toEqual(progress2);
    expect(mockFetchUserProgress).toHaveBeenCalledTimes(2);
  });
});
