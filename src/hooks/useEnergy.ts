import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_HEARTS, HEART_REGEN_MS } from '../constants';

const ENERGY_KEY = '@energy_v1';

interface PersistedEnergy {
  hearts: number;
  lastRegenAt: number;
}

export function useEnergy() {
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [secondsUntilRegen, setSecondsUntilRegen] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const save = useCallback((newHearts: number) => {
    const data: PersistedEnergy = { hearts: newHearts, lastRegenAt: Date.now() };
    AsyncStorage.setItem(ENERGY_KEY, JSON.stringify(data)).catch(() => null);
  }, []);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(ENERGY_KEY);
      if (!raw) {
        setHearts(MAX_HEARTS);
        setLoaded(true);
        return;
      }
      const stored: PersistedEnergy = JSON.parse(raw);
      const elapsed = Date.now() - stored.lastRegenAt;
      const regenCount = Math.floor(elapsed / HEART_REGEN_MS);
      const newHearts = Math.min(stored.hearts + regenCount, MAX_HEARTS);
      setHearts(newHearts);
      if (regenCount > 0) save(newHearts);
    } catch {
      setHearts(MAX_HEARTS);
    }
    setLoaded(true);
  }, [save]);

  // Countdown timer for next heart regen
  useEffect(() => {
    if (!loaded) return;
    if (hearts >= MAX_HEARTS) {
      setSecondsUntilRegen(0);
      return;
    }

    const tick = () => {
      const secs = Math.ceil(HEART_REGEN_MS / 1000);
      setSecondsUntilRegen(secs);
    };
    tick();

    timerRef.current = setInterval(() => {
      setSecondsUntilRegen(prev => {
        if (prev <= 1) {
          // Auto-regen
          setHearts(h => {
            const next = Math.min(h + 1, MAX_HEARTS);
            save(next);
            return next;
          });
          return Math.ceil(HEART_REGEN_MS / 1000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hearts, loaded, save]);

  useEffect(() => {
    load();
  }, [load]);

  const loseHeart = useCallback(() => {
    setHearts(prev => {
      const next = Math.max(0, prev - 1);
      save(next);
      return next;
    });
  }, [save]);

  const refillHearts = useCallback(() => {
    setHearts(MAX_HEARTS);
    save(MAX_HEARTS);
  }, [save]);

  return {
    hearts,
    maxHearts: MAX_HEARTS,
    secondsUntilRegen,
    loaded,
    loseHeart,
    refillHearts,
  };
}
