import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants';

interface TimerRingProps {
  /** Total duration in seconds */
  duration: number;
  /** Remaining seconds (drives the ring fill) */
  timeLeft: number;
  /** Outer diameter of the ring in pixels (default: 80) */
  size?: number;
  /** Width of the ring stroke (default: 7) */
  strokeWidth?: number;
}

/**
 * Animated circular countdown timer ring.
 *
 * Uses the two-half-circle rotation technique to draw a progress arc
 * without requiring react-native-svg.
 *
 * Color transitions:
 *  ≤ 3 s  → red
 *  ≤ 5 s  → orange
 *  > 5 s  → green
 */
export const TimerRing: React.FC<TimerRingProps> = ({
  duration,
  timeLeft,
  size = 80,
  strokeWidth = 7,
}) => {
  // progress 1 → 0 as time drains
  const progress      = useRef(new Animated.Value(timeLeft / duration)).current;
  const glowPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: timeLeft / duration,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, duration, progress]);

  // Danger zone: fast scale+glow pulse
  useEffect(() => {
    if (timeLeft <= 3) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulseAnim, { toValue: 1.08, duration: 150, useNativeDriver: true }),
          Animated.timing(glowPulseAnim, { toValue: 1.0,  duration: 150, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      glowPulseAnim.setValue(1);
    }
  }, [timeLeft <= 3]);

  const ringColor =
    timeLeft <= 3 ? COLORS.timerDanger : timeLeft <= 5 ? COLORS.timerWarning : COLORS.success;

  const textColor =
    timeLeft <= 3 ? COLORS.timerDanger : timeLeft <= 5 ? COLORS.timerWarning : COLORS.text;

  /**
   * Two-half-circle technique:
   *   - rightRot goes 0° → 180° during the first half of progress (100%→50%)
   *   - leftRot goes -180° → 0° during the second half (50%→0%)
   */
  const rightRot = progress.interpolate({
    inputRange: [0.5, 1],
    outputRange: ['0deg', '180deg'],
    extrapolate: 'clamp',
  });

  const leftRot = progress.interpolate({
    inputRange: [0, 0.5],
    outputRange: ['-180deg', '0deg'],
    extrapolate: 'clamp',
  });

  const half = size / 2;

  const glowShadow = timeLeft <= 5
    ? { shadowColor: ringColor, shadowOffset: { width: 0, height: 0 }, shadowOpacity: timeLeft <= 3 ? 0.7 : 0.4, shadowRadius: timeLeft <= 3 ? 16 : 8, elevation: 8 }
    : {};

  return (
    <Animated.View
      style={[styles.container, { width: size, height: size }, glowShadow, { transform: [{ scale: glowPulseAnim }] }]}
      accessibilityLabel={`${timeLeft} seconds remaining`}
    >
      {/* Track circle */}
      <View
        style={[
          styles.absolute,
          {
            width: size,
            height: size,
            borderRadius: half,
            borderWidth: strokeWidth,
            borderColor: COLORS.border,
          },
        ]}
      />

      {/* Right half fill */}
      <View
        style={[
          styles.halfContainer,
          { width: half, height: size, left: half },
        ]}
      >
        <Animated.View
          style={[
            styles.halfCircle,
            {
              width: size,
              height: size,
              borderRadius: half,
              borderWidth: strokeWidth,
              borderColor: ringColor,
              right: 0,
              transform: [{ rotate: rightRot }],
            },
          ]}
        />
      </View>

      {/* Left half fill */}
      <View
        style={[styles.halfContainer, { width: half, height: size, left: 0 }]}
      >
        <Animated.View
          style={[
            styles.halfCircle,
            {
              width: size,
              height: size,
              borderRadius: half,
              borderWidth: strokeWidth,
              borderColor: ringColor,
              left: 0,
              transform: [{ rotate: leftRot }],
            },
          ]}
        />
      </View>

      {/* Inner mask to create the donut shape */}
      <View
        style={[
          styles.absolute,
          {
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            backgroundColor: COLORS.background,
            left: strokeWidth,
            top: strokeWidth,
          },
        ]}
      />

      {/* Center countdown text */}
      <Text
        style={[styles.label, { color: textColor, fontSize: size * 0.32 }]}
      >
        {timeLeft}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  absolute: {
    position: 'absolute',
  },
  halfContainer: {
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
  },
  halfCircle: {
    position: 'absolute',
    top: 0,
  },
  label: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
  },
});
