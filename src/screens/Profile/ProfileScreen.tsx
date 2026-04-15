import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, Text, StyleSheet, View, ActivityIndicator,
  ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { updatePreferredLanguage, signOut } from '../../services/profileService';
import { useLevelProgress } from '../../hooks/useLevelProgress';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';
import type { TabScreenProps } from '../../types';

interface UserStats {
  totalAttempts: number;
  totalPassed: number;
  bestStreak: number;
  totalScore: number;
}

type Props = TabScreenProps<'Profile'>;

// ─── Spinning gradient ring ───────────────────────────────────────────────────
const SpinningRing: React.FC<{ initials: string }> = ({ initials }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 3200, useNativeDriver: true })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const RING = 108, FACE = 88, PAD = (RING - FACE) / 2;

  return (
    <View style={{ width: RING, height: RING, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{
        position: 'absolute', width: RING, height: RING,
        borderRadius: RING / 2, overflow: 'hidden',
        transform: [{ rotate }],
      }}>
        <LinearGradient
          colors={['#FDE047', '#F471B5', '#4ADE80', '#60A5FA', '#C084FC', '#FDE047']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ width: RING, height: RING }}
        />
      </Animated.View>
      <LinearGradient
        colors={['#FEF08A', '#FDE047']}
        style={{
          width: FACE, height: FACE, borderRadius: FACE / 2,
          justifyContent: 'center', alignItems: 'center',
          borderWidth: PAD, borderColor: COLORS.background,
        }}
      >
        <Text style={{
          fontFamily: 'SpaceGrotesk_700Bold',
          fontSize: 28, fontWeight: '900', color: '#1E1B4B',
        }}>{initials}</Text>
      </LinearGradient>
    </View>
  );
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: string; color: string; value: string; label: string; large?: boolean;
}> = ({ icon, color, value, label, large }) => (
  <View style={[styles.statCard, large && styles.statCardLarge]}>
    <View style={[styles.statIcon, { backgroundColor: color + '22', borderColor: color + '40' }]}>
      <Ionicons name={icon as any} size={large ? 22 : 18} color={color} />
    </View>
    <Text style={[styles.statValue, large && styles.statValueLarge]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { t, language, setLanguage } = useI18n();
  const { progress, loading: progressLoading } = useLevelProgress();
  const [stats, setStats]         = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [username, setUsername]   = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled && user) setIsAnonymous(user.is_anonymous ?? false);
        if (user && !cancelled) {
          const { data: ud } = await supabase.from('users').select('username').eq('id', user.id).single();
          if (!cancelled && ud) setUsername(ud.username);
          const { data: attempts } = await supabase.from('level_attempts').select('passed').eq('user_id', user.id);
          const { data: scores }   = await supabase.from('scores').select('score, streak').eq('user_id', user.id);
          if (!cancelled) {
            setStats({
              totalAttempts: attempts?.length ?? 0,
              totalPassed:   attempts?.filter(a => a.passed).length ?? 0,
              bestStreak:    scores?.reduce((m, s) => Math.max(m, s.streak ?? 0), 0) ?? 0,
              totalScore:    scores?.reduce((s, r) => s + (r.score ?? 0), 0) ?? 0,
            });
          }
        } else if (!cancelled) {
          setStats({ totalAttempts: 0, totalPassed: 0, bestStreak: 0, totalScore: 0 });
        }
      } catch {
        if (!cancelled) setStats({ totalAttempts: 0, totalPassed: 0, bestStreak: 0, totalScore: 0 });
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const loading          = progressLoading || statsLoading;
  const currentLevel     = progress?.current_level ?? 1;
  const highestUnlocked  = progress?.highest_level_unlocked ?? 1;
  const passRate         = stats && stats.totalAttempts > 0
    ? Math.round((stats.totalPassed / stats.totalAttempts) * 100) : 0;
  const initials         = (username ?? 'P').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView testID="profile-screen" style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4F46E5', '#4338CA', '#3B35BC']} style={StyleSheet.absoluteFill} pointerEvents="none" />
      {/* Top pink blob */}
      <View style={styles.blob} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <SpinningRing initials={initials} />
          <Text style={styles.usernameText}>{username ?? t('playerDefault')}</Text>
          <View style={styles.levelBadge}>
            <Ionicons name="flash" size={13} color={COLORS.primary} />
            <Text style={styles.levelBadgeText}>{t('level')} {currentLevel}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* ── Stats grid ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('yourStats')}</Text>
              {/* Top 2: large */}
              <View style={styles.heroRow}>
                <StatCard icon="trophy"           color={COLORS.gold}    value={String(currentLevel)} label={t('level')}    large />
                <StatCard icon="checkmark-circle" color="#4ADE80"        value={`${passRate}%`}        label={t('passRate')} large />
              </View>
              {/* Bottom 4: regular */}
              <View style={styles.statsGrid}>
                <StatCard icon="flame"           color="#FB923C"          value={String(stats?.bestStreak ?? 0)}               label={t('bestStreak')} />
                <StatCard icon="star"            color="#F471B5"          value={(stats?.totalScore ?? 0).toLocaleString()}     label={t('totalScore')} />
                <StatCard icon="game-controller" color={COLORS.primary}   value={String(stats?.totalAttempts ?? 0)}             label={t('gamesPlayed')} />
                <StatCard icon="rocket"          color="#C084FC"          value={String(highestUnlocked)}                       label={t('highestLevel')} />
              </View>
            </View>

            {/* ── Achievements ── */}
            <TouchableOpacity
              style={styles.achCard}
              onPress={() => navigation.navigate('Achievements')}
              activeOpacity={0.85}
            >
              <View style={[styles.achIcon, { backgroundColor: COLORS.gold + '20', borderColor: COLORS.gold + '40' }]}>
                <Ionicons name="medal" size={22} color={COLORS.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.achTitle}>{t('achievements')}</Text>
                <Text style={styles.achSub}>
                  {highestUnlocked >= 5 ? t('earnedBadges') : t('startEarningBadges')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.35)" />
            </TouchableOpacity>

            {/* ── Language ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('language').toUpperCase()}</Text>
              <View style={styles.langRow}>
                {(['en', 'tr'] as const).map(lang => (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.langBtn, language === lang && styles.langBtnActive]}
                    onPress={() => {
                      setLanguage(lang);
                      updatePreferredLanguage(lang).catch(() => {});
                    }}
                  >
                    <Text style={styles.langFlag}>{lang === 'en' ? '🇬🇧' : '🇹🇷'}</Text>
                    <Text style={[styles.langText, language === lang && { color: COLORS.primary }]}>
                      {lang === 'en' ? t('english') : t('turkish')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ── Premium ── */}
            <TouchableOpacity onPress={() => navigation.navigate('Paywall', {})} activeOpacity={0.88}>
              <LinearGradient
                colors={['#FEF08A', '#FDE047', '#F59E0B']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.9 }}
                style={styles.premiumCard}
              >
                <View style={styles.premiumShine} pointerEvents="none" />
                <View style={[styles.achIcon, { backgroundColor: 'rgba(30,27,75,0.15)', borderColor: 'rgba(30,27,75,0.2)' }]}>
                  <Ionicons name="diamond" size={22} color="#1E1B4B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.premiumTitle}>{t('premiumUpgrade')}</Text>
                  <Text style={styles.premiumSub}>{t('unlimitedHeartsNoAds')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(30,27,75,0.5)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* ── Referral ── */}
            <TouchableOpacity
              style={styles.refCard}
              onPress={() => navigation.navigate('Referral')}
              activeOpacity={0.85}
            >
              <Ionicons name="people" size={20} color="#60A5FA" />
              <Text style={styles.refText}>{t('referral')}</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.30)" />
            </TouchableOpacity>

            {/* ── Link Account (anonymous users only) ── */}
            {isAnonymous && (
              <TouchableOpacity
                style={styles.linkAccountBtn}
                onPress={() => navigation.navigate('AccountLink')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('accountLinkTitle')}
              >
                <LinearGradient
                  colors={['#FEF08A', '#FDE047']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.linkAccountGrad}
                >
                  <Ionicons name="link" size={20} color="#1E1B4B" />
                  <Text style={styles.linkAccountText}>{t('accountLinkTitle')}</Text>
                  <Ionicons name="chevron-forward" size={16} color="rgba(30,27,75,0.55)" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* ── Sign out ── */}
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={() => {
                Alert.alert(
                  t('signOutConfirmTitle'),
                  t('signOutConfirmBody'),
                  [
                    { text: t('cancel'), style: 'cancel' },
                    {
                      text: t('signOut'),
                      style: 'destructive',
                      onPress: async () => {
                        await signOut();
                      },
                    },
                  ],
                );
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
              <Text style={styles.signOutText}>{t('signOut')}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  blob: {
    position: 'absolute', top: -60, right: -50,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(244,113,181,0.14)',
  },
  scroll: { paddingBottom: 108 },

  hero: { alignItems: 'center', paddingTop: 24, paddingBottom: 28, gap: 10 },
  usernameText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5,
  },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(253,224,71,0.18)',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(253,224,71,0.35)',
  },
  levelBadgeText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 13, fontWeight: '800', color: COLORS.primary,
  },

  section: { paddingHorizontal: 18, marginBottom: 10, gap: 10 },
  sectionLabel: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.3, textTransform: 'uppercase',
  },

  heroRow: { flexDirection: 'row', gap: 10 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  statCard: {
    width: '47.5%',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.13)',
  },
  statCardLarge: { flex: 1, width: undefined },
  statIcon: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20, fontWeight: '900', color: '#FFFFFF',
  },
  statValueLarge: { fontSize: 26 },
  statLabel: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 10, color: 'rgba(255,255,255,0.48)',
    fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center',
  },

  achCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 18, marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18, padding: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.13)',
  },
  achIcon: {
    width: 48, height: 48, borderRadius: 14, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  achTitle: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 16, fontWeight: '800', color: '#FFFFFF',
  },
  achSub: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12, color: 'rgba(255,255,255,0.48)', marginTop: 2,
  },

  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.09)',
  },
  langBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(253,224,71,0.12)',
  },
  langFlag: { fontSize: 18 },
  langText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.55)',
  },

  premiumCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 18, marginBottom: 10,
    borderRadius: 20, padding: 18,
    overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: 'rgba(253,224,71,0.40)',
    shadowColor: '#FDE047',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
  },
  premiumShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    backgroundColor: 'rgba(255,255,255,0.26)',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  premiumTitle: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 16, fontWeight: '900', color: '#1E1B4B',
  },
  premiumSub: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12, color: 'rgba(30,27,75,0.65)', marginTop: 2,
  },

  refCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 18, marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)',
  },
  refText: {
    fontFamily: 'NunitoSans_700Bold',
    flex: 1, fontSize: 15, fontWeight: '700', color: '#FFFFFF',
  },
  linkAccountBtn: {
    marginHorizontal: 18, marginBottom: 10,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#FDE047', shadowOpacity: 0.3, shadowRadius: 10,
    elevation: 6,
  },
  linkAccountGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  linkAccountText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    flex: 1, fontSize: 15, color: '#1E1B4B',
  },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 18, marginBottom: 10,
    backgroundColor: 'rgba(248,113,113,0.10)',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1.5, borderColor: 'rgba(248,113,113,0.25)',
    justifyContent: 'center',
  },
  signOutText: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 15, fontWeight: '700', color: COLORS.danger,
  },
});
