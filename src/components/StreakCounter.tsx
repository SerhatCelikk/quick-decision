import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants';

interface Props {
  streak: number;
  size?: 'small' | 'large';
}

export const StreakCounter: React.FC<Props> = ({ streak, size = 'small' }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const isHot = streak >= 3;

  useEffect(() => {
    if (!isHot) return;

    // Pulse + glow loop
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.12, duration: 600, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 1, duration: 600, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: 600, useNativeDriver: false }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isHot, scale, glow]);

  const glowColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(249,115,22,0)', 'rgba(249,115,22,0.35)'],
  });

  const isLarge = size === 'large';
  const fireSize = isLarge ? 36 : 22;
  const numSize = isLarge ? 28 : 18;
  const labelSize = isLarge ? 13 : 10;
  const padH = isLarge ? 18 : 10;
  const padV = isLarge ? 12 : 6;
  const radius = isLarge ? 16 : 10;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingHorizontal: padH,
          paddingVertical: padV,
          borderRadius: radius,
          backgroundColor: glowColor,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={styles.row}>
        <Text style={{ fontSize: fireSize }}>{isHot ? '🔥' : '💧'}</Text>
        <View style={styles.textBlock}>
          <Text
            style={[
              styles.count,
              {
                fontSize: numSize,
                color: isHot ? COLORS.warning : COLORS.textMuted,
              },
            ]}
          >
            {streak}
          </Text>
          <Text style={[styles.label, { fontSize: labelSize }]}>
            {streak === 1 ? 'streak' : 'streaks'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textBlock: {
    alignItems: 'center',
  },
  count: {
    fontWeight: '800',
    lineHeight: 30,
  },
  label: {
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 12,
  },
});
