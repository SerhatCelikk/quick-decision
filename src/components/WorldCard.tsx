import React, { useRef, useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants';
import { useI18n } from '../i18n';

interface WorldCardProps {
  name: string;
  icon: string;
  color: string;
  dimColor: string;
  gradient: readonly [string, string];
  levelsCompleted: number;
  totalLevels: number;
  totalStars: number;
  maxStars: number;
  locked?: boolean;
  onPress?: () => void;
  testID?: string;
  // legacy emoji prop — kept for back-compat but unused
  emoji?: string;
  tint?: string;
}

export const WorldCard: React.FC<WorldCardProps> = ({
  name,
  icon,
  color,
  dimColor,
  gradient,
  levelsCompleted,
  totalLevels,
  totalStars,
  maxStars,
  locked = false,
  onPress,
  testID,
}) => {
  const { t } = useI18n();
  const progressPct = totalLevels > 0 ? (levelsCompleted / totalLevels) * 100 : 0;
  const pressAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (locked) return;
    Animated.timing(pressAnim, { toValue: 1, duration: 65, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    if (locked) return;
    Animated.spring(pressAnim, { toValue: 0, useNativeDriver: true, tension: 450, friction: 22 }).start();
  };

  // Periodic shine sweep across card header
  useEffect(() => {
    if (locked) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(shineAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shineAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(2500),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [locked]);

  const scale = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });
  const shineTranslateX = shineAnim.interpolate({ inputRange: [0, 1], outputRange: [-200, 400] });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        testID={testID}
        onPress={!locked ? onPress : undefined}
        disabled={locked}
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, locked && styles.locked]}
        accessibilityRole="button"
        accessibilityLabel={`${name} — ${t('levelsCompletedFmt').replace('{n}', String(levelsCompleted)).replace('{total}', String(totalLevels))}${locked ? ', ' + t('levelNodeLockedSuffix').replace(': ', '') : ''}`}
        accessibilityState={{ disabled: locked }}
      >
        {/* Gradient header */}
        <LinearGradient
          colors={locked ? ['#EDE8DC', '#F5F0E8'] : gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Shine sweep */}
          {!locked && (
            <Animated.View
              pointerEvents="none"
              style={[styles.shineSweep, { transform: [{ translateX: shineTranslateX }] }]}
            />
          )}
          {/* Icon circle */}
          <View style={[styles.iconCircle, { backgroundColor: locked ? COLORS.border : color + '22', borderColor: locked ? COLORS.border : color + '55' }]}>
            <Ionicons
              name={locked ? 'lock-closed' : icon as any}
              size={28}
              color={locked ? COLORS.textMuted : color}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={[styles.worldName, { color: locked ? COLORS.textMuted : '#FFFFFF' }]}>
              {name}
            </Text>
            <Text style={[styles.levelCount, { color: locked ? COLORS.textMuted : color }]}>
              {locked ? t('completePrevWorld') : t('levelsCountFmt').replace('{n}', String(levelsCompleted)).replace('{total}', String(totalLevels))}
            </Text>
          </View>

          {/* Star count */}
          {!locked && (
            <View style={styles.starBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.starText}>{totalStars}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Progress area */}
        <View style={styles.body}>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPct}%` as `${number}%`,
                    backgroundColor: locked ? COLORS.border : color,
                  },
                ]}
              />
              {/* Glow dot at the end of progress */}
              {!locked && progressPct > 0 && progressPct < 100 && (
                <View
                  style={[
                    styles.progressDot,
                    { left: `${progressPct}%` as `${number}%`, backgroundColor: color },
                  ]}
                />
              )}
            </View>
            <Text style={[styles.progressLabel, { color: locked ? COLORS.textMuted : COLORS.textSecondary }]}>
              {Math.round(progressPct)}%
            </Text>
          </View>

          {/* XP / star line */}
          {!locked && (
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Ionicons name="flash" size={12} color={dimColor} />
                <Text style={[styles.statChipText, { color: COLORS.textMuted }]}>
                  {totalLevels - levelsCompleted} levels left
                </Text>
              </View>
              <View style={styles.statChip}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={[styles.statChipText, { color: COLORS.textMuted }]}>
                  {totalStars} / {maxStars}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Right arrow for unlocked world */}
        {!locked && (
          <View style={[styles.chevron, { backgroundColor: color + '22' }]}>
            <Ionicons name="chevron-forward" size={18} color={color} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  locked: {
    opacity: 0.65,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  shineSweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.09)',
    transform: [{ skewX: '-20deg' }],
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  worldName: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  levelCount: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  starText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.background,
    borderRadius: 5,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 5,
  },
  progressDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    top: -2,
    marginLeft: -7,
    borderWidth: 2,
    borderColor: COLORS.surface,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  progressLabel: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    fontWeight: '700',
    minWidth: 36,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surface2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevron: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
