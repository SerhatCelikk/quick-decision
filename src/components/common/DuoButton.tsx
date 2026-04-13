import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
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
  /** If true, adds a subtle breathing pulse (for primary CTAs on home screen) */
  breathe?: boolean;
}

const VARIANT_CONFIG: Record<
  DuoButtonVariant,
  { gradient: readonly [string, string] | null; bg: string; shadow: string; text: string; border?: string }
> = {
  primary:   { gradient: ['#FF4C5E', '#FF7A40'], bg: COLORS.primary, shadow: COLORS.primaryDark, text: '#FFFFFF' },
  secondary: { gradient: null, bg: COLORS.surface2, shadow: COLORS.border, text: COLORS.text, border: COLORS.border },
  danger:    { gradient: ['#CC0030', '#FF1744'], bg: COLORS.danger, shadow: '#8B001C', text: '#FFFFFF' },
  gold:      { gradient: ['#CC9F00', '#FFD700'], bg: COLORS.gold, shadow: COLORS.goldDark, text: '#1A1200' },
  ghost:     { gradient: null, bg: 'transparent', shadow: 'transparent', text: COLORS.textSecondary, border: COLORS.border },
};

export const DuoButton: React.FC<DuoButtonProps> = ({
  label, variant = 'primary', onPress, disabled = false, style, icon, breathe = false,
}) => {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const v = VARIANT_CONFIG[variant];

  useEffect(() => {
    if (!breathe || disabled) return;
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
        Animated.timing(breatheAnim, { toValue: 1.0, duration: 1000, useNativeDriver: true }),
      ])
    );
    a.start();
    return () => a.stop();
  }, [breathe, disabled]);

  const handlePressIn = () => {
    if (disabled) return;
    Animated.timing(pressAnim, { toValue: 1, duration: 70, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(pressAnim, { toValue: 0, tension: 400, friction: 20, useNativeDriver: true }).start();
  };

  const translateY = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

  const content = (
    <View style={styles.innerRow}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.label, { color: disabled ? COLORS.textMuted : v.text }]}>{label}</Text>
    </View>
  );

  return (
    <Animated.View style={{ transform: [{ scale: breatheAnim }] }}>
      <View
        style={[
          styles.shadowContainer,
          {
            backgroundColor: disabled ? COLORS.border : v.shadow,
            borderColor: v.border ?? 'transparent',
            borderWidth: v.border ? 1.5 : 0,
            borderRadius: 16,
          },
          style,
        ]}
      >
        <Animated.View style={{ transform: [{ translateY }] }}>
          <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            activeOpacity={1}
            accessibilityRole="button"
            style={[
              styles.buttonBase,
              {
                backgroundColor: disabled ? COLORS.surface2 : v.bg,
                borderColor: v.border ?? 'transparent',
                borderWidth: v.border ? 1.5 : 0,
              },
            ]}
          >
            {v.gradient && !disabled ? (
              <LinearGradient colors={v.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
                {/* Shine overlay */}
                <View style={styles.shine} pointerEvents="none" />
                {content}
              </LinearGradient>
            ) : (
              content
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: { paddingBottom: 4 },
  buttonBase: {
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
    position: 'relative',
  },
  shine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
    backgroundColor: 'rgba(255,255,255,0.12)', borderTopLeftRadius: 14, borderTopRightRadius: 14,
  },
  innerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 24 },
  iconWrap: { marginRight: 2 },
  label: { fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
});
