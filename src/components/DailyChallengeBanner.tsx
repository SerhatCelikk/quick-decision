import React, { useEffect, useRef, useState } from 'react';
import { Animated, ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  // Mount bounce: slides up + overshoot
  const slideAnim = useRef(new Animated.Value(12)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Breathing glow border
  const glowAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Mount entrance
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 7, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Glow breathe — useNativeDriver:false (shadow props)
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.65, duration: 1800, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.2, duration: 1800, useNativeDriver: false }),
      ])
    );
    glow.start();
    return () => glow.stop();
  }, []);

  return (
    // Outer: animated glow border — useNativeDriver:false (shadow props)
    <Animated.View
      style={[
        styles.glowWrap,
        {
          shadowColor: COLORS.primary,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowAnim,
          shadowRadius: 14,
          elevation: 6,
        },
      ]}
    >
      {/* Inner: entrance slide + fade — useNativeDriver:true (transforms) */}
      <Animated.View
        style={[
          styles.bannerWrap,
          { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
        ]}
      >
      <TouchableOpacity
        style={styles.banner}
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t('dailyChallenge')}
      >
        <LinearGradient
          colors={['#FF4C5E', '#FFD700', '#FF6D00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentStripe}
        />

        <LinearGradient
          colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.07)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
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
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={onPress}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#FEF08A', '#FDE047']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ctaBtnInner}
                >
                  <Text style={styles.ctaText}>{t('play')}</Text>
                  <Ionicons name="arrow-forward" size={13} color="#1E1B4B" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
      </Animated.View>
    </Animated.View>
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
  // Outer: shadow glow layer (overflow visible so shadow renders)
  glowWrap: {
    borderRadius: RADIUS.lg,
  },
  // Inner: clip content to border radius
  bannerWrap: {
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '55',
    overflow: 'hidden',
  },
  banner: {
    overflow: 'hidden',
  },
  accentStripe: {
    height: 3,
  },
  gradient: {
    flexDirection: 'row',
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
    fontFamily: 'SpaceGrotesk_600SemiBold',
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
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.warning,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  description: {
    fontFamily: 'NunitoSans_400Regular',
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
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  ctaBtn: {
    marginLeft: 'auto',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ctaText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    fontWeight: '700',
    color: '#1E1B4B',
  },
});
