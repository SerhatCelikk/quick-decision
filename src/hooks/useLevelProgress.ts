import { useState, useEffect, useCallback } from 'react';
import {
  fetchUserProgress,
  submitLevelAttempt,
  type UserProgress,
  type LevelAttemptResult,
} from '../services/gameService';

interface UseLevelProgressReturn {
  progress: UserProgress | null;
  loading: boolean;
  submitAttempt: (
    levelNumber: number,
    correct: number,
    total: number
  ) => Promise<LevelAttemptResult | null>;
  refresh: () => Promise<void>;
}

export function useLevelProgress(): UseLevelProgressReturn {
  const [progress, setProgress] = useState<UserProgress | null>(null);
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
    ): Promise<LevelAttemptResult | null> => {
      const result = await submitLevelAttempt({
        levelNumber,
        questionsCorrect: correct,
        questionsTotal: total,
      });
      // Refresh local progress after a successful submission
      if (result) {
        const updated = await fetchUserProgress();
        setProgress(updated);
      }
      return result;
    },
    []
  );

  return { progress, loading, submitAttempt, refresh: load };
}
