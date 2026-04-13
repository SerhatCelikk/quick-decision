import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../constants';

/**
 * 4 answer states per design spec §5.2:
 * - idle:     surface bg, gray border
 * - selected: blue border + tinted bg (chosen but not yet revealed)
 * - correct:  green border + tinted bg + checkmark icon
 * - wrong:    red border + tinted bg + X icon + shake animation
 */
export type AnswerState = 'idle' | 'selected' | 'correct' | 'wrong';

interface OptionButtonProps {
  label: string;
  prefix: string;
  answerState: AnswerState;
  disabled: boolean;
  onPress: () => void;
}

export const OptionButton: React.FC<OptionButtonProps> = memo(({
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
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
    if (answerState === 'correct') {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.04, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
  }, [answerState, scaleAnim, shakeAnim]);

  const handlePressIn = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 400, friction: 20 }).start();
  };

  const isCorrect = answerState === 'correct';
  const isWrong = answerState === 'wrong';
  const isSelected = answerState === 'selected';

  const containerStyle = isCorrect
    ? styles.correct
    : isWrong
    ? styles.wrong
    : isSelected
    ? styles.selected
    : styles.idle;

  const prefixBg = isCorrect
    ? COLORS.brandGreen
    : isWrong
    ? COLORS.brandRed
    : isSelected
    ? COLORS.brandBlue
    : COLORS.border;

  const prefixColor = answerState === 'idle' ? COLORS.textMuted : '#FFFFFF';

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
        <View style={[styles.prefixBadge, { backgroundColor: prefixBg }]}>
          <Text style={[styles.prefixText, { color: prefixColor }]}>{prefix}</Text>
        </View>
        <Text style={styles.label}>{label}</Text>
        {isCorrect && (
          <Text style={[styles.stateIcon, { color: COLORS.brandGreen }]}>✓</Text>
        )}
        {isWrong && (
          <Text style={[styles.stateIcon, { color: COLORS.brandRed }]}>✗</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}) as React.FC<OptionButtonProps>;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'flex-start',  // allow label to wrap at large Dynamic Type sizes
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    minHeight: 64,             // no fixed height — grows with content
  },
  idle: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  selected: {
    backgroundColor: COLORS.selectedBg,
    borderColor: COLORS.selectedBorder,
    borderWidth: 3,
  },
  correct: {
    backgroundColor: COLORS.correctBg,
    borderColor: COLORS.correctBorder,
    borderWidth: 3,
  },
  wrong: {
    backgroundColor: COLORS.wrongBg,
    borderColor: COLORS.wrongBorder,
    borderWidth: 3,
  },
  prefixBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,  // optical alignment with first line of text
  },
  prefixText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  stateIcon: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
