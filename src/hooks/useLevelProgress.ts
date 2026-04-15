import { useState, useEffect, useCallback } from 'react';
import {
  fetchUserProgress,
  submitLevelAttempt,
  type UserProgress,
  type LevelAttemptResult,
} from '../services/gameService';

interface UseLevelProgressReturn {
  progress: UserProgress;
  loading: boolean;
  submitAttempt: (
    levelNumber: number,
    correct: number,
    total: number
  ) => Promise<LevelAttemptResult>;
  refresh: () => Promise<void>;
}

const DEFAULT_PROGRESS: UserProgress = { current_level: 1, highest_level_unlocked: 1 };

export function useLevelProgress(): UseLevelProgressReturn {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchUserProgress();
    setProgress(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitAttempt = useCallback(
    async (
      levelNumber: number,
      correct: number,
      total: number
    ): Promise<LevelAttemptResult> => {
      const result = await submitLevelAttempt({
        levelNumber,
        questionsCorrect: correct,
        questionsTotal: total,
      });
      // Always refresh progress after attempt (local store was updated)
      const updated = await fetchUserProgress();
      setProgress(updated);
      return result;
    },
    []
  );

  return { progress, loading, submitAttempt, refresh: load };
}
