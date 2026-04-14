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

// Prefix badge colors — bold, distinct on white
const PREFIX_CONFIG: Record<string, { from: string; to: string; depth: string }> = {
  A: { from: '#FF6B35', to: '#FF4D00', depth: '#B83600' },
  B: { from: '#3B82F6', to: '#2563EB', depth: '#1E3A8A' },
  C: { from: '#7C3AED', to: '#6D28D9', depth: '#4C1D95' },
  D: { from: '#10B981', to: '#059669', depth: '#065F46' },
};
const DEFAULT_CFG = PREFIX_CONFIG['A'];

// Reveal sweep on answer
const RevealSweep: React.FC<{ active: boolean; correct: boolean }> = ({ active, correct }) => {
  const sweep = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    if (!active) return;
    Animated.timing(sweep, {
      toValue: 1.5, duration: 180,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }, [active]);
  if (!active) return null;
  const colors = correct
    ? ['#059669', '#10B981', '#6EE7B7'] as const
    : ['#E11D48', '#F43F5E', '#FDA4AF'] as const;
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
  const scaleAnim    = useRef(new Animated.Value(1)).current;
  const shakeAnim    = useRef(new Animated.Value(0)).current;
  const pressDepth   = useRef(new Animated.Value(0)).current;
  // Non-native: glow opacity/radius for correct burst + wrong pulse
  const correctGlowOpacity = useRef(new Animated.Value(0)).current;
  const correctGlowRadius  = useRef(new Animated.Value(4)).current;
  const wrongGlowOpacity   = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  const isCorrect  = answerState === 'correct';
  const isWrong    = answerState === 'wrong';
  const isSelected = answerState === 'selected';
  const isIdle     = answerState === 'idle';
  const isRevealed = isCorrect || isWrong;

  useEffect(() => {
    if (answerState === 'wrong') {
      Animated.sequence([
        ...[-10, 10, -7, 7, -4, 4, 0].map(v =>
          Animated.timing(shakeAnim, { toValue: v, duration: 40, easing: Easing.linear, useNativeDriver: true })
        ),
      ]).start();
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 12, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(wrongGlowOpacity, { toValue: 0.55, duration: 150, useNativeDriver: false }),
        Animated.timing(wrongGlowOpacity, { toValue: 0.25, duration: 300, useNativeDriver: false }),
        Animated.timing(wrongGlowOpacity, { toValue: 0.5,  duration: 150, useNativeDriver: false }),
        Animated.timing(wrongGlowOpacity, { toValue: 0.2,  duration: 500, useNativeDriver: false }),
      ]).start();
    }
    if (answerState === 'correct') {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 130, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 320, friction: 7, useNativeDriver: true }),
      ]).start();
      Animated.parallel([
        Animated.timing(correctGlowOpacity, { toValue: 0.6, duration: 180, useNativeDriver: false }),
        Animated.timing(correctGlowRadius,  { toValue: 16,  duration: 180, useNativeDriver: false }),
      ]).start();
      Animated.sequence([
        Animated.timing(flashOpacity, { toValue: 0.18, duration: 80,  useNativeDriver: false }),
        Animated.timing(flashOpacity, { toValue: 0,    duration: 300, useNativeDriver: false }),
      ]).start();
    }
    if (answerState === 'selected') {
      Animated.timing(scaleAnim, { toValue: 1.015, duration: 80, useNativeDriver: true }).start();
    }
  }, [answerState]);

  const onPressIn  = () => {
    if (disabled) return;
    Animated.timing(pressDepth, { toValue: 1, duration: 60, useNativeDriver: true }).start();
    Animated.timing(scaleAnim, { toValue: 0.97, duration: 60, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    if (disabled) return;
    Animated.spring(pressDepth, { toValue: 0, tension: 350, friction: 18, useNativeDriver: true }).start();
    Animated.spring(scaleAnim,  { toValue: 1, tension: 350, friction: 18, useNativeDriver: true }).start();
  };

  const cfg = PREFIX_CONFIG[prefix] ?? DEFAULT_CFG;

  // Background/border per state
  const bgColor = isCorrect  ? COLORS.correctBg
    : isWrong    ? COLORS.wrongBg
    : isSelected ? COLORS.selectedBg
    : COLORS.surface;

  const borderColor = isCorrect  ? COLORS.correctBorder
    : isWrong    ? COLORS.wrongBorder
    : isSelected ? COLORS.selectedBorder
    : COLORS.border;

  // Depth layer color for 3D press
  const depthColor = isCorrect  ? '#059669'
    : isWrong    ? '#E11D48'
    : isSelected ? '#6D28D9'
    : 'rgba(0,0,0,0.30)';

  const glowShadow = isCorrect
    ? { shadowColor: '#059669', shadowOffset: { width: 0, height: 0 }, shadowOpacity: correctGlowOpacity, shadowRadius: correctGlowRadius, elevation: 8 }
    : isWrong
    ? { shadowColor: '#E11D48', shadowOffset: { width: 0, height: 0 }, shadowOpacity: wrongGlowOpacity, shadowRadius: 12, elevation: 6 }
    : {};

  const translateY = pressDepth.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

  return (
    // Outer: glow (non-native)
    <Animated.View style={glowShadow}>
      {/* Inner: scale + shake (native) */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateX: shakeAnim }] }}>
        {/* 3D depth layer */}
        <View style={[styles.depthLayer, { backgroundColor: depthColor, borderRadius: 18 }]}>
          <Animated.View style={{ transform: [{ translateY }] }}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: bgColor, borderColor, borderWidth: 2 }]}
              onPress={onPress}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={disabled}
              activeOpacity={1}
              accessibilityRole="button"
              accessibilityLabel={`Option ${prefix}: ${label}`}
              accessibilityState={{ disabled }}
            >
              {/* Reveal color sweep */}
              <RevealSweep active={isRevealed} correct={isCorrect} />

              {/* White flash */}
              {isCorrect && (
                <Animated.View
                  pointerEvents="none"
                  style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: flashOpacity, borderRadius: 18 }]}
                />
              )}

              {/* Prefix 3D badge */}
              {!isRevealed ? (
                <View style={[styles.prefixDepth, { backgroundColor: cfg.depth }]}>
                  <LinearGradient
                    colors={[cfg.from, cfg.to]}
                    style={styles.prefixBadge}
                  >
                    <Text style={styles.prefixText}>{prefix}</Text>
                  </LinearGradient>
                </View>
              ) : (
                <View style={[styles.prefixBadge, {
                  backgroundColor: isCorrect ? COLORS.success : COLORS.danger,
                  justifyContent: 'center', alignItems: 'center',
                  borderRadius: 14,
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

              {/* Result icon */}
              {isRevealed && (
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={isCorrect ? COLORS.success : COLORS.danger}
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}) as React.FC<OptionButtonProps>;

const styles = StyleSheet.create({
  depthLayer: {
    paddingBottom: 4,
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  btn: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    borderRadius: 18, paddingVertical: 16, paddingHorizontal: 14,
    minHeight: 68, gap: 12, overflow: 'hidden', position: 'relative',
    backgroundColor: COLORS.surface,
  },
  prefixDepth: {
    borderRadius: 14, paddingBottom: 3, overflow: 'hidden', flexShrink: 0,
  },
  prefixBadge: {
    width: 42, height: 42, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  prefixText: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 16, fontWeight: '900', color: '#FFFFFF',
  },
  label: {
    flex: 1,
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 16, fontWeight: '600', color: COLORS.text, lineHeight: 22, zIndex: 1,
  },
  labelCorrect:  {
    fontFamily: 'NunitoSans_700Bold',
    color: '#FFFFFF', fontWeight: '700',
  },
  labelWrong:    {
    fontFamily: 'NunitoSans_700Bold',
    color: '#FFFFFF', fontWeight: '700',
  },
  labelSelected: {
    fontFamily: 'NunitoSans_700Bold',
    color: '#FDE047', fontWeight: '700',
  },
});
