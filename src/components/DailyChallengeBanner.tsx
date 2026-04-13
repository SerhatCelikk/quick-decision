import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants';
import { useI18n } from '../i18n';
import { getDailyChallenge, type DailyChallenge } from '../services/socialService';

interface Props {
  onPress?: () => void;
}

function useCountdown(expiresAt: string, expiredLabel: string): string {
  const [label, setLabel] = React.useState('');
  useEffect(() => {
    function tick() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setLabel(expiredLabel); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setLabel(`${h}h ${m}m ${s}s`);
    }
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [expiresAt, expiredLabel]);
  return label;
}

const BannerInner: React.FC<{ challenge: DailyChallenge; onPress?: () => void }> = ({
  challenge,
  onPress,
}) => {
  const { t } = useI18n();
  const countdown = useCountdown(challenge.expiresAt, t('expired'));
  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={t('dailyChallenge')}
    >
      <LinearGradient
        colors={['#1E1040', '#120E30']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Left stripe */}
        <View style={styles.accentStripe} />

        <View style={styles.content}>
          {/* Top row */}
          <View style={styles.topRow}>
            <Ionicons name="flash" size={13} color={COLORS.primaryLight} />
            <Text style={styles.badgeLabel}>{t('dailyChallengeLabel')}</Text>
            <View style={styles.countdownBadge}>
              <Ionicons name="time-outline" size={10} color={COLORS.warning} />
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{challenge.description}</Text>

          {/* Bottom stats */}
          <View style={styles.bottomRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{challenge.targetScore.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{t('targetLabel')}</Text>
            </View>
            <View style={[styles.stat, styles.statSeparated]}>
              <Text style={styles.statValue}>{challenge.participants.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{t('playersLabel')}</Text>
            </View>
            <View style={styles.ctaBtn}>
              <Text style={styles.ctaText}>{t('play')}</Text>
              <Ionicons name="arrow-forward" size={13} color="#fff" />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export const DailyChallengeBanner: React.FC<Props> = ({ onPress }) => {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyChallenge().then(setChallenge).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator color={COLORS.primaryLight} size="small" />
      </View>
    );
  }

  if (!challenge) return null;
  return <BannerInner challenge={challenge} onPress={onPress} />;
};

const styles = StyleSheet.create({
  placeholder: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  banner: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.primary + '55',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    flexDirection: 'row',
  },
  accentStripe: {
    width: 4,
    backgroundColor: COLORS.primaryLight,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 7,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1,
    flex: 1,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.background,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  countdownText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.warning,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  stat: {
    alignItems: 'center',
  },
  statSeparated: {
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  ctaBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
