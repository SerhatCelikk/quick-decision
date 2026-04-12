/**
 * Auth flow tests — covers useAuth hook state and the Supabase
 * unauthenticated path that queues actions.
 *
 * Full Supabase auth integration requires a live Supabase instance;
 * these tests verify the hook contract and the fallback behaviour
 * when no user is present.
 */
import { renderHook } from '@testing-library/react-native';
import { useAuth } from '../hooks/useAuth';

describe('useAuth', () => {
  it('returns null user and loading=false by default', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('returns stable shape with user and loading fields', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('loading');
  });
});

describe('Unauthenticated path — queuing behaviour', () => {
  /**
   * When user is null, submitLevelAttempt and submitScore should
   * queue to AsyncStorage instead of hitting Supabase.
   * This is tested in depth in gameService.test.ts.
   * Here we document the contract: no user → queue.
   */
  it('no user present means offline queue will be used for submissions', () => {
    // This is a documentation test — the actual behaviour is verified
    // in gameService.test.ts via the submitLevelAttempt and submitScore tests.
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    // Confirms offline queue path will be triggered for any submission
  });
});
