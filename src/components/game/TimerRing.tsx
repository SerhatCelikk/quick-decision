import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

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
  const progress = useRef(new Animated.Value(timeLeft / duration)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: timeLeft / duration,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, duration, progress]);

  const ringColor =
    timeLeft <= 3 ? '#ef4444' : timeLeft <= 5 ? '#f97316' : '#22c55e';

  const textColor =
    timeLeft <= 3 ? '#ef4444' : timeLeft <= 5 ? '#f97316' : '#f8fafc';

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

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
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
            borderColor: '#1e293b',
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
            backgroundColor: '#0f172a',
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
    </View>
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
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
  },
});
