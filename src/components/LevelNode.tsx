import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { useI18n } from '../i18n';
import { useReducedMotion } from '../hooks/useReducedMotion';

export type LevelNodeState = 'locked' | 'unlocked' | 'completed' | 'current';

interface LevelNodeProps {
  levelNumber: number;
  state: LevelNodeState;
  stars?: 0 | 1 | 2 | 3;
  color: string;
  dimColor: string;
  gradient: readonly [string, string];
  onPress?: () => void;
}

// Star row beneath node
const MiniStars: React.FC<{ stars: number; color: string }> = ({ stars, color }) => (
  <View style={starRow.row}>
    {[0, 1, 2].map(i => (
      <Ionicons
        key={i}
        name={i < stars ? 'star' : 'star-outline'}
        size={9}
        color={i < stars ? '#FFD700' : color + '44'}
      />
    ))}
  </View>
);

const starRow = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 2 },
});

const NODE = 72;
const CORNER = 22;

export const LevelNode: React.FC<LevelNodeProps> = ({
  levelNumber,
  state,
  stars = 0,
  color,
  dimColor,
  gradient,
  onPress,
}) => {
  const { t } = useI18n();
  const isLocked = state === 'locked';
  const isCurrent = state === 'current';
  const isCompleted = state === 'completed';
  const reduceMotion = useReducedMotion();

  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;
  const pressDepth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isCurrent || reduceMotion) { pulseScale.setValue(1); pulseOpacity.setValue(0); return; }
    const a = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.38, duration: 950, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1, duration: 950, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0, duration: 950, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.7, duration: 950, useNativeDriver: true }),
        ]),
      ])
    );
    a.start();
    return () => a.stop();
  }, [isCurrent, reduceMotion]);

  const handlePressIn = () => {
    if (isLocked) return;
    Animated.timing(pressDepth, { toValue: 1, duration: 70, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    if (isLocked) return;
    Animated.spring(pressDepth, { toValue: 0, tension: 300, friction: 15, useNativeDriver: true }).start();
  };

  const translateY = pressDepth.interpolate({ inputRange: [0, 1], outputRange: [0, 5] });

  let accessibilityLabel = `${t('level')} ${levelNumber}`;
  let accessibilityHint: string | undefined;
  if (isLocked) {
    accessibilityLabel += t('levelNodeLockedSuffix');
    accessibilityHint = t('completePrevLevels');
  } else if (isCompleted) {
    accessibilityLabel += t('levelNodeCompletedFmt').replace('{stars}', String(stars));
  } else if (isCurrent) {
    accessibilityLabel += t('levelNodeCurrentSuffix');
    accessibilityHint = t('doubleTapToStart');
  } else {
    accessibilityLabel += t('levelNodeUnlockedSuffix');
    accessibilityHint = t('doubleTapToStart');
  }

  const shadowColor = isLocked ? COLORS.border : dimColor;
  const completedGrad: readonly [string, string] = ['#047857', '#10B981'];
  const finalGrad = isCompleted ? completedGrad : gradient;

  return (
    <TouchableOpacity
      onPress={!isLocked ? onPress : undefined}
      disabled={isLocked}
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isLocked }}
    >
      {/* nodeArea: fixed-size container so pulse ring positions relative to node */}
      <View style={styles.nodeArea}>
        {/* Pulse ring — absolutely centered within nodeArea */}
        {isCurrent && (
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: color, transform: [{ scale: pulseScale }], opacity: pulseOpacity },
            ]}
            pointerEvents="none"
          />
        )}

        {/* 3D depth shadow layer */}
        <View
          style={[
            styles.depthShadow,
            { backgroundColor: shadowColor, borderRadius: CORNER },
          ]}
        />

        {/* Node face */}
        <Animated.View style={{ transform: [{ translateY }] }}>
          {isLocked ? (
            <View style={[styles.node, styles.nodeLocked]}>
              <Ionicons name="lock-closed" size={24} color={COLORS.textMuted} />
              <Text style={styles.numLocked}>{levelNumber}</Text>
            </View>
          ) : (
            <LinearGradient
              colors={finalGrad}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={[styles.node, styles.nodeActive]}
            >
              <View style={styles.nodeShine} />
              <Ionicons
                name={isCompleted ? 'checkmark-sharp' : 'play-sharp'}
                size={isCompleted ? 26 : 22}
                color="#FFFFFF"
              />
              <Text style={styles.num}>{levelNumber}</Text>
            </LinearGradient>
          )}
        </Animated.View>
      </View>

      {/* Stars below node */}
      <MiniStars stars={stars} color={color} />
    </TouchableOpacity>
  );
};

// PULSE_EXTRA: how much bigger the ring is than the node on each side
const PULSE_EXTRA = 12;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  // nodeArea is exactly NODE×NODE so absolute children position correctly
  nodeArea: {
    width: NODE,
    height: NODE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: NODE + PULSE_EXTRA * 2,
    height: NODE + PULSE_EXTRA * 2,
    borderRadius: CORNER + PULSE_EXTRA,
    borderWidth: 3,
    top: -PULSE_EXTRA,
    left: -PULSE_EXTRA,
    zIndex: 0,
  },
  depthShadow: {
    position: 'absolute',
    width: NODE,
    height: NODE,
    top: 6,
    zIndex: 0,
  },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: CORNER,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    overflow: 'hidden',
  },
  nodeActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
  },
  nodeLocked: {
    backgroundColor: COLORS.surface2,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  nodeShine: {
    position: 'absolute',
    top: 6,
    left: 8,
    width: NODE - 16,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.18)',
    zIndex: 2,
  },
  num: {
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    lineHeight: 15,
  },
  numLocked: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
