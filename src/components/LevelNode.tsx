import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants';
import { StarRating } from './StarRating';
import { useReducedMotion } from '../hooks/useReducedMotion';

export type LevelNodeState = 'locked' | 'unlocked' | 'completed' | 'current';

interface LevelNodeProps {
  levelNumber: number;
  state: LevelNodeState;
  stars?: 0 | 1 | 2 | 3;
  color: string;
  dimColor: string;
  onPress?: () => void;
}

export const LevelNode: React.FC<LevelNodeProps> = ({
  levelNumber,
  state,
  stars = 0,
  color,
  dimColor,
  onPress,
}) => {
  const isLocked = state === 'locked';
  const isCurrent = state === 'current';
  const isCompleted = state === 'completed';
  const reduceMotion = useReducedMotion();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isCurrent || reduceMotion) {
      pulseAnim.setValue(1);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.14, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isCurrent, pulseAnim, reduceMotion]);

  const nodeBg = isLocked ? COLORS.surface : dimColor;
  const borderColor = isLocked ? COLORS.border : color;
  const borderWidth = isCurrent ? 3 : 2;

  const label = isLocked ? '🔒' : isCompleted ? '✓' : '▶';

  // Accessibility label per design spec §1 (CHO-133)
  let accessibilityLabel: string;
  let accessibilityHint: string | undefined;
  if (isLocked) {
    accessibilityLabel = `Level ${levelNumber}: locked`;
    accessibilityHint = 'Complete previous levels to unlock';
  } else if (isCompleted) {
    accessibilityLabel = `Level ${levelNumber}: completed with ${stars} star${stars !== 1 ? 's' : ''}`;
  } else if (isCurrent) {
    accessibilityLabel = `Level ${levelNumber}: current level`;
    accessibilityHint = 'Double-tap to start';
  } else {
    accessibilityLabel = `Level ${levelNumber}: unlocked`;
    accessibilityHint = 'Double-tap to start';
  }

  return (
    <TouchableOpacity
      onPress={!isLocked ? onPress : undefined}
      disabled={isLocked}
      activeOpacity={0.75}
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isLocked }}
    >
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <View
          style={[
            styles.node,
            { backgroundColor: nodeBg, borderColor, borderWidth },
          ]}
        >
          <Text style={[styles.levelNum, isLocked && styles.lockedText, { color: isLocked ? COLORS.textMuted : color }]}>
            {levelNumber}
          </Text>
          <Text style={[styles.stateIcon, { color: isLocked ? COLORS.textMuted : color }]}>{label}</Text>
        </View>
      </Animated.View>

      {isCompleted && stars > 0 && (
        <View style={styles.starsRow}>
          <StarRating stars={stars} size={10} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 2,
    // Ensure minimum 44pt touch target via padding
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  node: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  levelNum: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },
  lockedText: {
    color: COLORS.textMuted,
  },
  stateIcon: {
    fontSize: 11,
    fontWeight: '700',
  },
  starsRow: {
    marginTop: 3,
  },
});
