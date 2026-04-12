import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

type AnswerState = 'idle' | 'correct' | 'wrong';

interface OptionButtonProps {
  /** Label text displayed on the button */
  label: string;
  /** Short prefix badge, e.g. "A" or "B" */
  prefix: string;
  /** Current answer state for this button */
  answerState: AnswerState;
  /** Whether the button is disabled (after an answer is selected) */
  disabled: boolean;
  /** Called when the user taps this option */
  onPress: () => void;
}

/**
 * A single game answer option button.
 *
 * - Press scales down then back (tap feedback)
 * - Turns green/red based on answerState (correct/wrong)
 * - Shake animation on wrong answer
 */
export const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  prefix,
  answerState,
  disabled,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (answerState === 'wrong') {
      // Shake left-right on wrong answer
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
    if (answerState === 'correct') {
      // Subtle bounce on correct
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.04, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [answerState, scaleAnim, shakeAnim]);

  const handlePressIn = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: 0.94,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const containerStyle =
    answerState === 'correct'
      ? styles.correct
      : answerState === 'wrong'
      ? styles.wrong
      : styles.idle;

  const prefixStyle =
    answerState === 'correct'
      ? styles.prefixCorrect
      : answerState === 'wrong'
      ? styles.prefixWrong
      : styles.prefixIdle;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { transform: [{ scale: scaleAnim }, { translateX: shakeAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[styles.button, containerStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`Option ${prefix}: ${label}`}
        accessibilityState={{ disabled }}
      >
        <Text style={[styles.prefix, prefixStyle]}>{prefix}</Text>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
  },
  idle: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  correct: {
    backgroundColor: '#14532d',
    borderColor: '#22c55e',
  },
  wrong: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
  },
  prefix: {
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 14,
    overflow: 'hidden',
  },
  prefixIdle: {
    backgroundColor: '#334155',
    color: '#94a3b8',
  },
  prefixCorrect: {
    backgroundColor: '#15803d',
    color: '#bbf7d0',
  },
  prefixWrong: {
    backgroundColor: '#7f1d1d',
    color: '#fca5a5',
  },
  label: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: '#f8fafc',
  },
});
