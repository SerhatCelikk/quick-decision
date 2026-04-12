import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ProgressBarProps {
  /** Current step (0-based or 1-based, consistent with total) */
  current: number;
  /** Total number of steps */
  total: number;
  /** Height of the bar in pixels (default: 6) */
  height?: number;
  /** Show "X / Y" text label (default: true) */
  showLabel?: boolean;
}

/**
 * Animated horizontal progress bar for level/question completion.
 * Smoothly animates width changes as current advances.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  height = 6,
  showLabel = true,
}) => {
  const ratio = total > 0 ? Math.min(current / total, 1) : 0;
  const widthAnim = useRef(new Animated.Value(ratio)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: total > 0 ? Math.min(current / total, 1) : 0,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [current, total, widthAnim]);

  const fillColor = widthAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#6366f1', '#8b5cf6', '#22c55e'],
  });

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={styles.label}>
          {current} / {total}
        </Text>
      )}
      <View
        style={[styles.track, { height, borderRadius: height / 2 }]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: current }}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              borderRadius: height / 2,
              backgroundColor: fillColor,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '600',
  },
  track: {
    width: '100%',
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
