import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Share, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';
import { StreakCounter } from '../../components/StreakCounter';
import { getShareData, type ShareData } from '../../services/socialService';

type TierKey = 'tierLegendary' | 'tierElite' | 'tierPro' | 'tierRising';
type Tier = { labelKey: TierKey; color: string; icon: string; gradient: readonly [string, string] };
function getTier(score: number): Tier {
  if (score >= 10_000) return { labelKey: 'tierLegendary', color: COLORS.gold,      icon: 'trophy',  gradient: ['#78350F', '#CA8A04'] };
  if (score >= 5_000)  return { labelKey: 'tierElite',     color: COLORS.accent,    icon: 'diamond', gradient: ['#831843', '#BE185D'] };
  if (score >= 1_000)  return { labelKey: 'tierPro',       color: COLORS.timerSafe, icon: 'flash',   gradient: ['#1E3A8A', '#1D4ED8'] };
  return                      { labelKey: 'tierRising',    color: COLORS.success,   icon: 'leaf',    gradient: ['#166534', '#16A34A'] };
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
          <Text style={[styles.tierLabel, { color: tier.color }]}>{t(tier.labelKey)}</Text>
        </View>
      </View>

      <Text style={styles.cardUsername}>{data.username}</Text>
      <Text style={styles.cardTagline}>{t('thinkFastTagline')}</Text>

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

      <LinearGradient colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.15)']} style={styles.codeSection}>
        <Text style={styles.codeSectionLabel}>{t('challengeMeWithCode')}</Text>
        <Text style={styles.codeText}>{data.shareCode}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

export const ShareCardScreen: React.FC = () => {
  const { t } = useI18n();
  const navigation = useNavigation();
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
          `${shareData.username}\n` +
          `${t('level')} ${shareData.level}\n` +
          `${t('totalScore')}: ${shareData.totalScore.toLocaleString()}\n` +
          `${t('bestStreak')}: ${shareData.bestStreak}\n\n` +
          `${t('challengeMeWithCode')}: ${shareData.shareCode}`,
        title: t('shareCardTitle'),
      });
    } catch { /* user cancelled */ }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4F46E5', '#4338CA', '#3B35BC']} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('goBack')}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t('shareYourStats')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 60 }} size="large" />
        ) : shareData ? (
          <>
            <ShareCard data={shareData} />
            <TouchableOpacity style={styles.shareBtnWrap} onPress={handleShare} activeOpacity={0.88}>
              <LinearGradient colors={['#FEF08A', '#FDE047']} style={styles.shareBtn}>
                <Ionicons name="share-social" size={20} color="#1E1B4B" />
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

  navBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14, gap: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center', alignItems: 'center',
  },
  navTitle: {
    flex: 1, textAlign: 'center',
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3,
  },

  inner: {
    flex: 1, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32,
    alignItems: 'center', gap: 16,
  },

  card: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.11)', borderRadius: 24, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 18, elevation: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  cardStripe: { height: 6 },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardLogo: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 14, fontWeight: '800', color: COLORS.text },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, gap: 4,
  },
  tierLabel: { fontFamily: 'NunitoSans_700Bold', fontSize: 12, fontWeight: '700' },
  cardUsername: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28, fontWeight: '900', color: COLORS.text, paddingHorizontal: 20, marginTop: 12,
  },
  cardTagline: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12, color: COLORS.textMuted, paddingHorizontal: 20, marginTop: 2, fontStyle: 'italic',
  },

  statsGrid: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.20)', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  statCell: { flex: 1, paddingVertical: 16, alignItems: 'center', gap: 6 },
  statCellMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  statBig: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, fontWeight: '900' },
  statSub: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 9, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600',
  },

  codeSection: {
    margin: 20, padding: 14, borderRadius: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  codeSectionLabel: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: '700',
  },
  codeText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, fontWeight: '900', color: COLORS.primary, letterSpacing: 6 },

  shareBtnWrap: {
    width: '100%', borderRadius: 18, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  shareBtn: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  shareBtnText: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 17, fontWeight: '800', color: '#1E1B4B' },

  emptyWrap: { alignItems: 'center', gap: 12, marginTop: 60 },
  errorText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 15, color: COLORS.textMuted },
});
