import React, { useEffect, useRef } from 'react';
import {
  Animated, StyleSheet, Text, TouchableOpacity, View,
  StyleProp, ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants';

export type DuoButtonVariant = 'primary' | 'secondary' | 'danger' | 'gold' | 'ghost';

interface DuoButtonProps {
  label: string;
  variant?: DuoButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  breathe?: boolean;
}

const VARIANT_CONFIG: Record<DuoButtonVariant, {
  gradient: readonly [string, string] | null;
  bg: string;
  text: string;
  border?: string;
  glowColor: string;
}> = {
  primary:   { gradient: ['#FEF08A', '#FDE047'], bg: '#FDE047',              text: '#1E1B4B', glowColor: '#FDE047' },
  secondary: { gradient: null,                   bg: 'rgba(255,255,255,0.14)', text: '#FFFFFF', border: 'rgba(255,255,255,0.3)', glowColor: 'transparent' },
  danger:    { gradient: ['#FCA5A5', '#F87171'], bg: '#F87171',              text: '#FFFFFF', glowColor: '#F87171' },
  gold:      { gradient: ['#FEF08A', '#FDE047'], bg: '#FDE047',              text: '#1E1B4B', glowColor: '#FDE047' },
  ghost:     { gradient: null,                   bg: 'transparent',           text: 'rgba(255,255,255,0.65)', border: 'rgba(255,255,255,0.22)', glowColor: 'transparent' },
};

export const DuoButton: React.FC<DuoButtonProps> = ({
  label, variant = 'primary', onPress, disabled = false, style, icon, breathe = false,
}) => {
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-120)).current;
  const v = VARIANT_CONFIG[variant];

  useEffect(() => {
    if (!breathe || disabled) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.00, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathe, disabled]);

  useEffect(() => {
    if (variant !== 'primary' || disabled) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2200),
        Animated.timing(shimmerAnim, { toValue: 320, duration: 520, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: -120, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [variant, disabled]);

  const onPressIn  = () => Animated.timing(scaleAnim, { toValue: 0.95, duration: 75, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 15, useNativeDriver: true }).start();

  const glowStyle = v.glowColor !== 'transparent' && !disabled ? {
    shadowColor: v.glowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.50,
    shadowRadius: 14,
    elevation: 8,
  } : {};

  const content = (
    <View style={styles.innerRow}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.label, { color: disabled ? 'rgba(255,255,255,0.30)' : v.text }]}>
        {label}
      </Text>
    </View>
  );

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, glowStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        activeOpacity={1}
        accessibilityRole="button"
        style={[
          styles.btn,
          {
            backgroundColor: disabled ? 'rgba(255,255,255,0.18)' : (v.gradient ? 'transparent' : v.bg),
            borderColor: v.border ?? 'transparent',
            borderWidth: v.border ? 1.5 : 0,
            overflow: 'hidden',
          },
        ]}
      >
        {v.gradient && !disabled ? (
          <LinearGradient
            colors={v.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.9 }}
            style={styles.gradient}
          >
            <View style={styles.shine} pointerEvents="none" />
            {variant === 'primary' && (
              <Animated.View
                pointerEvents="none"
                style={[styles.shimmer, { transform: [{ translateX: shimmerAnim }] }]}
              />
            )}
            {content}
          </LinearGradient>
        ) : (
          content
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1, width: '100%',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 24, position: 'relative',
  },
  shine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '52%',
    backgroundColor: 'rgba(255,255,255,0.26)',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
  },
  shimmer: {
    position: 'absolute', top: 0, bottom: 0, width: 56,
    backgroundColor: 'rgba(255,255,255,0.22)',
    transform: [{ skewX: '-18deg' }],
  },
  innerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingHorizontal: 24,
  },
  iconWrap: { marginRight: 2 },
  label: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 17, fontWeight: '800', letterSpacing: 0.3,
  },
});
