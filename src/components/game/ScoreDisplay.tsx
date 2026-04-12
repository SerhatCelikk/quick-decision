import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ScoreDisplayProps {
  /** Current score value */
  score: number;
  /** Optional label shown above the value (default: "Score") */
  label?: string;
}

/**
 * Score display with an animated counting-up effect when the value changes.
 * Also briefly scales up on increment to give a satisfying feedback pop.
 */
export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  label = 'Score',
}) => {
  const [displayScore, setDisplayScore] = useState(score);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevScoreRef = useRef(score);

  useEffect(() => {
    if (score === prevScoreRef.current) return;

    const from = prevScoreRef.current;
    const to = score;
    prevScoreRef.current = score;

    // Animate the number counting up
    const steps = 12;
    const stepDuration = 40;
    let step = 0;

    const interval = setInterval(() => {
      step += 1;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayScore(Math.round(from + (to - from) * eased));

      if (step >= steps) {
        clearInterval(interval);
        setDisplayScore(to);
      }
    }, stepDuration);

    // Pop scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.25,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearInterval(interval);
  }, [score, scaleAnim]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Animated.Text
        style={[styles.value, { transform: [{ scale: scaleAnim }] }]}
      >
        {displayScore.toLocaleString()}
      </Animated.Text>
    </View>
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
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
});
