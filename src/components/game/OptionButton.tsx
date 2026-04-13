import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

export type AnswerState = 'idle' | 'selected' | 'correct' | 'wrong';

interface OptionButtonProps {
  label: string;
  prefix: string;
  answerState: AnswerState;
  disabled: boolean;
  onPress: () => void;
}

// Per-letter prefix gradients — vivid, distinct
const PREFIX_GRADIENTS: Record<string, readonly [string, string]> = {
  A: ['#1A6BD4', '#2979FF'],   // electric blue
  B: ['#CC5500', '#FF6D00'],   // orange
  C: ['#9B1FCC', '#C84DFF'],   // vivid violet
  D: ['#007A38', '#00C060'],   // forest green
};
const DEFAULT_GRAD: readonly [string, string] = ['#1A6BD4', '#2979FF'];

// Reveal sweep overlay: animates from left to right on reveal
const RevealSweep: React.FC<{ active: boolean; correct: boolean }> = ({ active, correct }) => {
  const sweep = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    if (!active) return;
    Animated.timing(sweep, {
      toValue: 1.2,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [active]);

  if (!active) return null;
  const colors = correct
    ? ['#00BF5A', '#00E676', '#69FFB0'] as const
    : ['#CC0030', '#FF1744', '#FF4D6A'] as const;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { transform: [{ scaleX: sweep }], transformOrigin: 'left' }]}
      pointerEvents="none"
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
};

export const OptionButton: React.FC<OptionButtonProps> = memo(({
  label, prefix, answerState, disabled, onPress,
}) => {
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const shakeAnim   = useRef(new Animated.Value(0)).current;
  const selectedGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (answerState === 'wrong') {
      // 7-frame shake
      Animated.sequence([
        ...[-8, 8, -6, 6, -4, 4, 0].map(v =>
          Animated.timing(shakeAnim, { toValue: v, duration: 45, easing: Easing.linear, useNativeDriver: true })
        ),
      ]).start();
      // Scale micro-bounce down
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 12, useNativeDriver: true }),
      ]).start();
    }
    if (answerState === 'correct') {
      // Bounce up then spring settle
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.07, duration: 110, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 280, friction: 8, useNativeDriver: true }),
      ]).start();
    }
    if (answerState === 'selected') {
      // Subtle pulse glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(selectedGlow, { toValue: 1, duration: 500, useNativeDriver: false }),
          Animated.timing(selectedGlow, { toValue: 0.6, duration: 500, useNativeDriver: false }),
        ])
      ).start();
      Animated.timing(scaleAnim, { toValue: 1.02, duration: 80, useNativeDriver: true }).start();
    }
  }, [answerState]);

  const onPressIn = () => {
    if (disabled) return;
    Animated.timing(scaleAnim, { toValue: 0.96, duration: 65, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, { toValue: 1, tension: 350, friction: 18, useNativeDriver: true }).start();
  };

  const isCorrect  = answerState === 'correct';
  const isWrong    = answerState === 'wrong';
  const isIdle     = answerState === 'idle';
  const isSelected = answerState === 'selected';
  const isRevealed = isCorrect || isWrong;

  // Background color for each state
  const bgColor = isCorrect ? COLORS.correctBg
    : isWrong    ? COLORS.wrongBg
    : isSelected ? COLORS.selectedBg
    : COLORS.surface2;

  // Border
  const borderColor = isCorrect  ? COLORS.correctBorder
    : isWrong    ? COLORS.wrongBorder
    : isSelected ? COLORS.selectedBorder
    : COLORS.border;
  const borderWidth = isIdle ? 1.5 : 2.5;

  // Prefix badge gradient
  const prefixGrad = isSelected
    ? ['#6B3FCC', '#9B6DFF'] as const
    : (PREFIX_GRADIENTS[prefix] ?? DEFAULT_GRAD);

  // When revealed: dim non-selected correct/wrong buttons slightly
  const opacity = isWrong && !isCorrect ? 1 : 1;

  return (
    <Animated.View style={{
      transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
      opacity,
    }}>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: bgColor, borderColor, borderWidth }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`Option ${prefix}: ${label}`}
        accessibilityState={{ disabled }}
      >
        {/* Reveal sweep animation */}
        <RevealSweep active={isRevealed} correct={isCorrect} />

        {/* Shine on idle */}
        {(isIdle || isSelected) && (
          <View style={styles.shine} pointerEvents="none" />
        )}

        {/* Prefix badge */}
        {!isRevealed ? (
          <LinearGradient colors={prefixGrad} style={styles.prefixBadge}>
            <Text style={styles.prefixText}>{prefix}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.prefixBadge, {
            backgroundColor: isCorrect ? COLORS.success : COLORS.danger,
            justifyContent: 'center', alignItems: 'center',
          }]}>
            <Ionicons name={isCorrect ? 'checkmark' : 'close'} size={20} color="#fff" />
          </View>
        )}

        {/* Label */}
        <Text
          style={[
            styles.label,
            isCorrect && styles.labelCorrect,
            isWrong   && styles.labelWrong,
            isSelected && styles.labelSelected,
          ]}
          numberOfLines={3}
        >
          {label}
        </Text>

        {/* Result icon on right */}
        {isRevealed && (
          <Ionicons
            name={isCorrect ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={isCorrect ? COLORS.success : COLORS.danger}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}) as React.FC<OptionButtonProps>;

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    borderRadius: 16, paddingVertical: 15, paddingHorizontal: 14,
    minHeight: 62, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
    overflow: 'hidden', position: 'relative',
  },
  shine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  prefixBadge: {
    width: 38, height: 38, borderRadius: 13,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4, elevation: 2,
  },
  prefixText:    { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
  label:         { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text, lineHeight: 21, zIndex: 1 },
  labelCorrect:  { color: '#EAFFF2', fontWeight: '700' },
  labelWrong:    { color: '#FFE4EA', fontWeight: '700' },
  labelSelected: { color: '#EDE8FF', fontWeight: '700' },
});
