import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface StreakCounterProps {
  /** Current streak count (0 = no streak) */
  streak: number;
  /** Optional label (default: "Streak") */
  label?: string;
}

/**
 * Streak counter with a fire emoji that pulses and scales up on streak increases.
 * Fades to muted state when streak is 0.
 */
export const StreakCounter: React.FC<StreakCounterProps> = ({
  streak,
  label = 'Streak',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(streak > 0 ? 1 : 0.4)).current;
  const fireScaleAnim = useRef(new Animated.Value(1)).current;
  const prevStreakRef = useRef(streak);

  useEffect(() => {
    const prev = prevStreakRef.current;
    prevStreakRef.current = streak;

    if (streak > prev) {
      // Streak increased — pop + fire pulse
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(fireScaleAnim, { toValue: 1.6, duration: 100, useNativeDriver: true }),
          Animated.timing(fireScaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    } else if (streak === 0 && prev > 0) {
      // Streak broken — fade out
      Animated.timing(opacityAnim, {
        toValue: 0.4,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [streak, scaleAnim, opacityAnim, fireScaleAnim]);

  return (
    <Animated.View
      style={[styles.container, { opacity: opacityAnim }]}
      accessibilityLabel={streak > 0 ? `Streak: ${streak}` : 'No streak'}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Animated.Text
          style={[styles.fire, { transform: [{ scale: fireScaleAnim }] }]}
        >
          🔥
        </Animated.Text>
        <Animated.Text
          style={[styles.count, { transform: [{ scale: scaleAnim }] }]}
        >
          {streak > 0 ? streak : '—'}
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  fire: {
    fontSize: 16,
  },
  count: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f97316',
  },
});
