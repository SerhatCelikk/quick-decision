import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants';
import { DuoButton } from '../common/DuoButton';

interface FactRevealProps {
  /** Optional fun fact to display below the verdict */
  fact?: string | null;
  /** Whether the player's answer was correct */
  answerCorrect: boolean;
  /** Whether the question timed out (no choice made) */
  timedOut: boolean;
  /** Current streak count — shown as bonus label when > 1 */
  streak: number;
  /** Called when the player taps Continue */
  onContinue: () => void;
}

/**
 * Duolingo-style feedback banner (§6.3).
 *
 * Slides up from the bottom with a spring animation (300ms overshoot).
 * - Correct: green tinted bg, checkmark icon, "+XP" badge
 * - Wrong:   red tinted bg, X icon, encouraging subtitle
 * Tap "Continue" slides the banner back down as the next question slides in.
 */
export const FactReveal: React.FC<FactRevealProps> = ({
  fact,
  answerCorrect,
  timedOut,
  streak,
  onContinue,
}) => {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const isCorrect = answerCorrect && !timedOut;
  const bgColor = isCorrect ? COLORS.correctBg : COLORS.wrongBg;
  const borderColor = isCorrect ? COLORS.brandGreen : COLORS.brandRed;
  const iconText = isCorrect ? '✓' : '✗';
  const iconColor = isCorrect ? COLORS.brandGreen : COLORS.brandRed;
  const xpEarned = isCorrect ? 10 * Math.min(streak, 3) : 0;

  const resultLabel = timedOut
    ? "Time's up!"
    : isCorrect
    ? streak > 1
      ? `Streak ×${streak}!`
      : 'Correct!'
    : 'Oops!';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderTopColor: borderColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {/* Verdict row */}
      <View style={styles.headerRow}>
        <Text style={[styles.verdictIcon, { color: iconColor }]}>{iconText}</Text>
        <Text style={[styles.resultLabel, { color: iconColor }]}>{resultLabel}</Text>
        {xpEarned > 0 && (
          <View style={[styles.xpBadge, { backgroundColor: COLORS.brandPurple }]}>
            <Text style={styles.xpText}>+{xpEarned} XP</Text>
          </View>
        )}
      </View>

      {/* Optional fact */}
      {fact ? (
        <View style={[styles.factBox, { borderColor }]}>
          <Text style={styles.factHeading}>Did you know?</Text>
          <Text style={styles.factText}>{fact}</Text>
        </View>
      ) : !isCorrect ? (
        <Text style={styles.encouragement}>Keep going — you've got this!</Text>
      ) : null}

      {/* Continue button */}
      <DuoButton
        label="Continue"
        variant={isCorrect ? 'primary' : 'danger'}
        onPress={onContinue}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  verdictIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  resultLabel: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  xpBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  factBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  factHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  factText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  encouragement: {
    fontSize: 14,
    color: COLORS.brandRed,
    marginBottom: 16,
    fontWeight: '500',
  },
});
