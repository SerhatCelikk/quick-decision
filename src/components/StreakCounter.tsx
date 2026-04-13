import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants';

interface Props {
  streak: number;
  size?: 'small' | 'large';
}

export const StreakCounter: React.FC<Props> = ({ streak, size = 'small' }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const isHot = streak >= 3;
  const isLarge = size === 'large';

  useEffect(() => {
    if (!isHot) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.1, duration: 650, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 650, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0, duration: 650, useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isHot, scale, glowOpacity]);

  const iconSize = isLarge ? 32 : 20;
  const countSize = isLarge ? 26 : 16;
  const labelSize = isLarge ? 12 : 10;
  const padH = isLarge ? 16 : 10;
  const padV = isLarge ? 10 : 6;

  return (
    <View>
      {/* Glow layer */}
      {isHot && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.glow,
            { opacity: glowOpacity },
          ]}
          pointerEvents="none"
        />
      )}
      <Animated.View
        style={[
          styles.container,
          {
            paddingHorizontal: padH,
            paddingVertical: padV,
            borderColor: isHot ? COLORS.warning + '55' : COLORS.border,
            transform: [{ scale }],
          },
        ]}
      >
        <Ionicons
          name={isHot ? 'flame' : 'water'}
          size={iconSize}
          color={isHot ? COLORS.warning : COLORS.accent}
        />
        <View style={styles.textBlock}>
          <Text style={[styles.count, { fontSize: countSize, color: isHot ? COLORS.warning : COLORS.textSecondary }]}>
            {streak}
          </Text>
          <Text style={[styles.label, { fontSize: labelSize }]}>
            {streak === 1 ? 'streak' : 'streaks'}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface2,
  },
  glow: {
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warning,
    opacity: 0.15,
  },
  textBlock: {
    alignItems: 'center',
  },
  count: {
    fontWeight: '800',
    lineHeight: 28,
  },
  label: {
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    lineHeight: 12,
  },
});
