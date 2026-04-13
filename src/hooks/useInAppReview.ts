import { useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REVIEW_PROMPTED_KEY = '@quick_decision_review_prompted';
const MIN_SESSIONS_BEFORE_REVIEW = 5;
const SESSION_COUNT_KEY = '@quick_decision_session_count';

/**
 * Hook to trigger in-app review at the right moment.
 * Triggers after the user has passed MIN_SESSIONS_BEFORE_REVIEW levels
 * and only once per install.
 */
export function useInAppReview() {
  const reviewing = useRef(false);

  const maybeRequestReview = useCallback(async () => {
    if (reviewing.current) return;
    try {
      const alreadyPrompted = await AsyncStorage.getItem(REVIEW_PROMPTED_KEY);
      if (alreadyPrompted) return;

      const countStr = await AsyncStorage.getItem(SESSION_COUNT_KEY);
      const count = parseInt(countStr ?? '0', 10) + 1;
      await AsyncStorage.setItem(SESSION_COUNT_KEY, String(count));

      if (count < MIN_SESSIONS_BEFORE_REVIEW) return;

      reviewing.current = true;
      await AsyncStorage.setItem(REVIEW_PROMPTED_KEY, 'true');

      // expo-store-review is not installed; in a production build this would be:
      //   import * as StoreReview from 'expo-store-review';
      //   if (await StoreReview.hasAction()) await StoreReview.requestReview();
      //
      // For now, this hook primes the logic correctly. Add expo-store-review
      // before the next EAS build to activate the native prompt.
      console.info('[InAppReview] Review prompt would trigger here (expo-store-review not installed).');
    } catch {
      // Non-critical — silently ignore
    } finally {
      reviewing.current = false;
    }
  }, []);

  return { maybeRequestReview };
}
