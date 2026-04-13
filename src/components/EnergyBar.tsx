import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS } from '../constants';
import { useI18n } from '../i18n';

interface EnergyBarProps {
  hearts: number;
  maxHearts?: number;
  size?: number;
  secondsUntilRegen?: number;
  onWatchAd?: () => void;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Single heart icon
const Heart: React.FC<{ filled: boolean; size: number; pulsing: Animated.Value }> = ({
  filled,
  size,
  pulsing,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (filled) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 10 }),
      ]).start();
    }
  }, [filled]);

  return (
    <Animated.View style={{ transform: [{ scale: filled ? scaleAnim : 1 }], opacity: filled ? 1 : pulsing }}>
      <Ionicons
        name={filled ? 'heart' : 'heart-outline'}
        size={size}
        color={filled ? COLORS.danger : COLORS.border}
      />
    </Animated.View>
  );
};

export const EnergyBar: React.FC<EnergyBarProps> = ({
  hearts,
  maxHearts = 5,
  size = 22,
  secondsUntilRegen,
  onWatchAd,
}) => {
  const { t } = useI18n();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hearts <= 0) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.25, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [hearts, pulseAnim]);

  const showCountdown = hearts < maxHearts && secondsUntilRegen && secondsUntilRegen > 0;
  const showAdBtn = hearts <= 0 && onWatchAd;

  return (
    <View style={styles.wrapper}>
      {/* Hearts row */}
      <View style={styles.row}>
        {Array.from({ length: maxHearts }, (_, i) => (
          <Heart key={i} filled={i < hearts} size={size} pulsing={pulseAnim} />
        ))}
      </View>

      {/* Countdown */}
      {showCountdown && (
        <View style={styles.countdownRow}>
          <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.countdown}>
            {t('nextHeartInFmt').replace('{time}', formatTime(secondsUntilRegen!))}
          </Text>
        </View>
      )}

      {/* Watch ad button */}
      {showAdBtn && (
        <TouchableOpacity
          style={styles.adBtn}
          onPress={onWatchAd}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('watchAdRefill')}
        >
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.adBtnInner}>
            <Ionicons name="play-circle-outline" size={16} color="#fff" />
            <Text style={styles.adBtnText}>{t('watchAdRefill')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 5,
  },
  row: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countdown: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  adBtn: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  adBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  adBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
