import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FloatingScoreProps {
  points: number;
  streak?: number;
  x?: number;
  y?: number;
  onComplete?: () => void;
}

/**
 * Floating "+XP" text that rises and fades out.
 * Mount it; it self-animates and calls onComplete when done.
 */
export const FloatingScore: React.FC<FloatingScoreProps> = ({
  points,
  streak = 1,
  x = 0,
  y = 0,
  onComplete,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      // Pop in
      Animated.spring(scale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
      // Float up
      Animated.timing(translateY, { toValue: -80, duration: 900, useNativeDriver: true }),
      // Fade: appear then fade
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.delay(300),
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start(() => onComplete?.());
  }, []);

  const isStreak = streak > 2;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          left: x - 40,
          top: y,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {isStreak && (
        <View style={styles.streakRow}>
          <Ionicons name="flame" size={12} color="#FF6B35" />
          <Text style={styles.streakLabel}>{streak}x</Text>
        </View>
      )}
      <Text style={[styles.points, isStreak && styles.pointsStreak]}>
        +{points}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 999,
    pointerEvents: 'none',
  } as any,
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF6B35',
  },
  points: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(255,215,0,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  pointsStreak: {
    fontSize: 30,
    color: '#FF6B35',
    textShadowColor: 'rgba(255,107,53,0.4)',
  },
});
