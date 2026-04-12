import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../../constants';

export type DuoButtonVariant = 'primary' | 'secondary' | 'danger';

interface DuoButtonProps {
  label: string;
  variant?: DuoButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_STYLES: Record<
  DuoButtonVariant,
  { bg: string; shadow: string; text: string; border?: string }
> = {
  primary: {
    bg: COLORS.brandGreen,
    shadow: COLORS.brandGreenDark,
    text: '#FFFFFF',
  },
  secondary: {
    bg: COLORS.surface,
    shadow: COLORS.border,
    text: COLORS.text,
    border: COLORS.border,
  },
  danger: {
    bg: COLORS.brandRed,
    shadow: COLORS.brandRedDark,
    text: '#FFFFFF',
  },
};

/**
 * Duolingo-style 3D-press button (§5.1).
 * The bottom shadow collapses from 4px to 2px and the button shifts
 * down 2px on press, giving the signature Duolingo push feel.
 */
export const DuoButton: React.FC<DuoButtonProps> = ({
  label,
  variant = 'primary',
  onPress,
  disabled = false,
  style,
}) => {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const v = VARIANT_STYLES[variant];

  const handlePressIn = () => {
    if (disabled) return;
    Animated.timing(pressAnim, { toValue: 1, duration: 80, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(pressAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 400,
      friction: 20,
    }).start();
  };

  // Translates down 2px on press (shadow collapses from 4px to 2px)
  const translateY = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 2] });

  return (
    <View
      style={[
        styles.shadowContainer,
        { backgroundColor: disabled ? COLORS.border : v.shadow },
        style,
      ]}
    >
      <Animated.View style={{ transform: [{ translateY }] }}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: disabled ? COLORS.surface : v.bg,
              borderColor: v.border ?? 'transparent',
              borderWidth: v.border ? 2 : 0,
            },
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.label,
              { color: disabled ? COLORS.textMuted : v.text },
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowContainer: {
    borderRadius: 14,
    paddingBottom: 4, // provides the "depth" below the button
  },
  button: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
