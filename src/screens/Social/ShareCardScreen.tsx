import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Share, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';
import { StreakCounter } from '../../components/StreakCounter';
import { getShareData, type ShareData } from '../../services/socialService';

// Tier config — no emojis, Ionicons only
type Tier = { label: string; color: string; icon: string; gradient: readonly [string, string] };
function getTier(score: number): Tier {
  if (score >= 10_000) return { label: 'Legendary', color: COLORS.gold,     icon: 'trophy',   gradient: ['#2A2000', '#3D3000'] };
  if (score >= 5_000)  return { label: 'Elite',     color: COLORS.accent,   icon: 'diamond',  gradient: ['#001820', '#002530'] };
  if (score >= 1_000)  return { label: 'Pro',       color: COLORS.timerSafe, icon: 'flash',   gradient: ['#001040', '#001A60'] };
  return                      { label: 'Rising',    color: COLORS.success,  icon: 'leaf',     gradient: ['#001A08', '#002510'] };
}

const ShareCard: React.FC<{ data: ShareData }> = ({ data }) => {
  const { t } = useI18n();
  const scale   = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  const tier = getTier(data.totalScore);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
      {/* Top gradient stripe */}
      <LinearGradient colors={tier.gradient} style={styles.cardStripe} />

      {/* Logo row */}
      <View style={styles.cardHeader}>
        <View style={styles.logoRow}>
          <Ionicons name="flash" size={15} color={COLORS.primary} />
          <Text style={styles.cardLogo}>Quick Decision</Text>
        </View>
        <View style={[styles.tierBadge, { borderColor: tier.color + '88', backgroundColor: tier.color + '15' }]}>
          <Ionicons name={tier.icon as any} size={13} color={tier.color} />
          <Text style={[styles.tierLabel, { color: tier.color }]}>{tier.label}</Text>
        </View>
      </View>

      {/* Username */}
      <Text style={styles.cardUsername}>{data.username}</Text>
      <Text style={styles.cardTagline}>{t('thinkFastTagline')}</Text>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={[styles.statBig, { color: COLORS.primary }]}>
            {data.totalScore.toLocaleString()}
          </Text>
          <Text style={styles.statSub}>Total Score</Text>
        </View>
        <View style={[styles.statCell, styles.statCellMid]}>
          <Text style={[styles.statBig, { color: COLORS.gold }]}>Lv {data.level}</Text>
          <Text style={styles.statSub}>Level</Text>
        </View>
        <View style={styles.statCell}>
          <StreakCounter streak={data.bestStreak} size="small" />
          <Text style={styles.statSub}>Best Streak</Text>
        </View>
      </View>

      {/* Share code */}
      <LinearGradient colors={['#0A0820', '#12102E']} style={styles.codeSection}>
        <Text style={styles.codeSectionLabel}>{t('challengeMeWithCode')}</Text>
        <Text style={styles.codeText}>{data.shareCode}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

export const ShareCardScreen: React.FC = () => {
  const { t } = useI18n();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getShareData().then(setShareData).finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    if (!shareData) return;
    try {
      await Share.share({
        message:
          `I'm playing Quick Decision!\n\n` +
          `${shareData.username}\n` +
          `Level ${shareData.level}\n` +
          `Score: ${shareData.totalScore.toLocaleString()}\n` +
          `Best Streak: ${shareData.bestStreak}\n\n` +
          `Challenge me with code: ${shareData.shareCode}\n` +
          `Download Quick Decision and beat my score!`,
        title: 'My Quick Decision Stats',
      });
    } catch { /* user cancelled */ }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.heading}>{t('shareYourStats')}</Text>
        <Text style={styles.subheading}>{t('showOffProgress')}</Text>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 60 }} size="large" />
        ) : shareData ? (
          <>
            <ShareCard data={shareData} />
            <TouchableOpacity style={styles.shareBtnWrap} onPress={handleShare} activeOpacity={0.88}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.shareBtn}>
                <Ionicons name="share-social" size={20} color="#fff" />
                <Text style={styles.shareBtnText}>{t('shareCard')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyWrap}>
            <Ionicons name="person-circle" size={56} color={COLORS.textMuted} />
            <Text style={styles.errorText}>{t('signInToSeeCard')}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: {
    flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32,
    alignItems: 'center', gap: 16,
  },
  heading:    { fontSize: 26, fontWeight: '900', color: COLORS.text, alignSelf: 'flex-start', letterSpacing: -0.5 },
  subheading: { fontSize: 13, color: COLORS.textMuted, alignSelf: 'flex-start', marginTop: -10 },

  card: {
    width: '100%', backgroundColor: COLORS.surface, borderRadius: 24, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 18, elevation: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  cardStripe: { height: 6 },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardLogo: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, gap: 4,
  },
  tierLabel: { fontSize: 12, fontWeight: '700' },
  cardUsername: {
    fontSize: 28, fontWeight: '900', color: COLORS.text, paddingHorizontal: 20, marginTop: 12,
  },
  cardTagline: {
    fontSize: 12, color: COLORS.textMuted, paddingHorizontal: 20, marginTop: 2, fontStyle: 'italic',
  },

  statsGrid: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 20,
    backgroundColor: COLORS.background, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  statCell: { flex: 1, paddingVertical: 16, alignItems: 'center', gap: 6 },
  statCellMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  statBig: { fontSize: 20, fontWeight: '900' },
  statSub: {
    fontSize: 9, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600',
  },

  codeSection: {
    margin: 20, padding: 14, borderRadius: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  codeSectionLabel: {
    fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: '700',
  },
  codeText: { fontSize: 24, fontWeight: '900', color: COLORS.primary, letterSpacing: 6 },

  shareBtnWrap: {
    width: '100%', borderRadius: 18, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  shareBtn: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  shareBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  emptyWrap: { alignItems: 'center', gap: 12, marginTop: 60 },
  errorText: { fontSize: 15, color: COLORS.textMuted },
});
