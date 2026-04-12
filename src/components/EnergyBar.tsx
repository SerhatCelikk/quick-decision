import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants';

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

export const EnergyBar: React.FC<EnergyBarProps> = ({
  hearts,
  maxHearts = 5,
  size = 22,
  secondsUntilRegen,
  onWatchAd,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hearts <= 0) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
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
      <View style={styles.row}>
        {Array.from({ length: maxHearts }, (_, i) => {
          const filled = i < hearts;
          const isEmpty = !filled && hearts <= 0;
          return (
            <Animated.Text
              key={i}
              style={[
                { fontSize: size, lineHeight: size + 4 },
                isEmpty && { opacity: pulseAnim },
              ]}
            >
              {filled ? '❤️' : '🖤'}
            </Animated.Text>
          );
        })}
      </View>

      {showCountdown && (
        <Text style={styles.countdown}>
          Next ❤️ in {formatTime(secondsUntilRegen!)}
        </Text>
      )}

      {showAdBtn && (
        <TouchableOpacity style={styles.adBtn} onPress={onWatchAd} activeOpacity={0.8}>
          <Text style={styles.adBtnText}>📺 Watch Ad to Refill</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  countdown: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  adBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  adBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
