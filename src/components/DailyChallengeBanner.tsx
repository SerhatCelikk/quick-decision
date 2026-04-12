import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants';
import { getDailyChallenge, type DailyChallenge } from '../services/socialService';

interface Props {
  onPress?: () => void;
}

function useCountdown(expiresAt: string): string {
  const [label, setLabel] = React.useState('');

  useEffect(() => {
    function tick() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setLabel('Expired'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setLabel(`${h}h ${m}m ${s}s`);
    }
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return label;
}

const BannerInner: React.FC<{ challenge: DailyChallenge; onPress?: () => void }> = ({
  challenge,
  onPress,
}) => {
  const countdown = useCountdown(challenge.expiresAt);

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Left accent */}
      <View style={styles.accent} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.fireEmoji}>⚡</Text>
          <Text style={styles.label}>DAILY CHALLENGE</Text>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </View>

        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.description}>{challenge.description}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{challenge.targetScore.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Target Score</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{challenge.participants.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Players</Text>
          </View>
          <View style={styles.ctaBadge}>
            <Text style={styles.ctaText}>Play Now →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const DailyChallengeBanner: React.FC<Props> = ({ onPress }) => {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyChallenge()
      .then(setChallenge)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator color={COLORS.primary} size="small" />
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
    borderRadius: 16,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  accent: {
    width: 4,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fireEmoji: {
    fontSize: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    flex: 1,
  },
  countdownBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.warning,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  description: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ctaBadge: {
    marginLeft: 'auto',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
