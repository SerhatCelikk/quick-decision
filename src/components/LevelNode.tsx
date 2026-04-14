import React, { useEffect, useRef } from 'react';
import {
  Animated, StyleSheet, Text, TouchableOpacity, View,
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

const MiniStars: React.FC<{ stars: number; color: string }> = ({ stars, color }) => (
  <View style={starRow.row}>
    {[0, 1, 2].map(i => (
      <Ionicons
        key={i}
        name={i < stars ? 'star' : 'star-outline'}
        size={10}
        color={i < stars ? '#F59E0B' : COLORS.border}
      />
    ))}
  </View>
);
const starRow = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 2 },
});

const NODE = 76;
const CORNER = 22;
const PULSE_EXTRA = 16;
const DEPTH = 6;

export const LevelNode: React.FC<LevelNodeProps> = ({
  levelNumber, state, stars = 0, color, dimColor, gradient, onPress,
}) => {
  const { t } = useI18n();
  const isLocked    = state === 'locked';
  const isCurrent   = state === 'current';
  const isCompleted = state === 'completed';
  const reduceMotion = useReducedMotion();

  const pulseScale   = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.5)).current;
  const pulseScale2   = useRef(new Animated.Value(1)).current;
  const pulseOpacity2 = useRef(new Animated.Value(0.3)).current;
  const pressDepth   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isCurrent || reduceMotion) {
      pulseScale.setValue(1);   pulseOpacity.setValue(0);
      pulseScale2.setValue(1);  pulseOpacity2.setValue(0);
      return;
    }
    const a = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.38, duration: 950, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1,    duration: 950, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0,   duration: 950, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.5, duration: 950, useNativeDriver: true }),
        ]),
      ])
    );
    const b = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(475),
          Animated.timing(pulseScale2, { toValue: 1.38, duration: 950, useNativeDriver: true }),
          Animated.timing(pulseScale2, { toValue: 1,    duration: 950, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(475),
          Animated.timing(pulseOpacity2, { toValue: 0,   duration: 950, useNativeDriver: true }),
          Animated.timing(pulseOpacity2, { toValue: 0.3, duration: 950, useNativeDriver: true }),
        ]),
      ])
    );
    a.start(); b.start();
    return () => { a.stop(); b.stop(); };
  }, [isCurrent, reduceMotion]);

  const handlePressIn  = () => {
    if (isLocked) return;
    Animated.timing(pressDepth, { toValue: 1, duration: 70, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    if (isLocked) return;
    Animated.spring(pressDepth, { toValue: 0, tension: 300, friction: 15, useNativeDriver: true }).start();
  };

  const translateY = pressDepth.interpolate({ inputRange: [0, 1], outputRange: [0, DEPTH] });

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

  const completedGrad: readonly [string, string] = ['#059669', '#10B981'];
  const finalGrad = isCompleted ? completedGrad : gradient;
  // 3D depth color
  const depthColor = isLocked ? 'rgba(0,0,0,0.25)' : isCompleted ? '#065F46' : (color + 'CC');

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
      <View style={styles.nodeArea}>
        {/* Pulse ring 1 */}
        {isCurrent && (
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: color, borderWidth: 3, transform: [{ scale: pulseScale }], opacity: pulseOpacity },
            ]}
            pointerEvents="none"
          />
        )}
        {/* Pulse ring 2 — staggered */}
        {isCurrent && (
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: color + '66', borderWidth: 2, transform: [{ scale: pulseScale2 }], opacity: pulseOpacity2 },
            ]}
            pointerEvents="none"
          />
        )}

        {/* 3D depth shadow */}
        <View style={[styles.depthShadow, { backgroundColor: depthColor, borderRadius: CORNER + 2 }]} />

        {/* Node face */}
        <Animated.View style={{ transform: [{ translateY }] }}>
          {isLocked ? (
            <View style={styles.nodeLocked}>
              <Ionicons name="lock-closed" size={22} color="rgba(255,255,255,0.55)" />
              <Text style={styles.numLocked}>{levelNumber}</Text>
            </View>
          ) : (
            <LinearGradient
              colors={finalGrad}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={[styles.node, isCurrent && {
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.55,
                shadowRadius: 12,
                elevation: 10,
              }]}
            >
              {/* Top shine */}
              <View style={styles.shine} />
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

      <MiniStars stars={stars} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', paddingVertical: 4 },
  nodeArea: {
    width: NODE, height: NODE,
    alignItems: 'center', justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: NODE + PULSE_EXTRA * 2,
    height: NODE + PULSE_EXTRA * 2,
    borderRadius: CORNER + PULSE_EXTRA,
    top: -PULSE_EXTRA, left: -PULSE_EXTRA,
    zIndex: 0,
  },
  depthShadow: {
    position: 'absolute',
    width: NODE, height: NODE,
    top: DEPTH, zIndex: 0,
  },
  node: {
    width: NODE, height: NODE,
    borderRadius: CORNER,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 1, overflow: 'hidden',
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  nodeLocked: {
    width: NODE, height: NODE,
    borderRadius: CORNER,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.18)',
    zIndex: 1,
  },
  shine: {
    position: 'absolute', top: 5, left: 8,
    width: NODE - 16, height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    zIndex: 2,
  },
  num: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 14, fontWeight: '800', color: 'rgba(255,255,255,0.95)', marginTop: 2,
  },
  numLocked: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 13, fontWeight: '700', color: COLORS.textMuted, marginTop: 2,
  },
});
