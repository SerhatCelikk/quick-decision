import React, { useEffect, useState } from 'react';
import {
  Text, StyleSheet, View, ActivityIndicator, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
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

const StatCard: React.FC<{
  icon: string; iconColor: string; value: string; label: string;
}> = ({ icon, iconColor, value, label }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconWrap, { backgroundColor: iconColor + '22', borderColor: iconColor + '44' }]}>
      <Ionicons name={icon as any} size={20} color={iconColor} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { t, language, setLanguage } = useI18n();
  const { progress, loading: progressLoading } = useLevelProgress();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !cancelled) {
          const { data: ud } = await supabase.from('users').select('username').eq('id', user.id).single();
          if (!cancelled && ud) setUsername(ud.username);
          const { data: attempts } = await supabase.from('level_attempts').select('passed').eq('user_id', user.id);
          const { data: scores } = await supabase.from('scores').select('score, streak').eq('user_id', user.id);
          if (!cancelled) {
            setStats({
              totalAttempts: attempts?.length ?? 0,
              totalPassed: attempts?.filter(a => a.passed).length ?? 0,
              bestStreak: scores?.reduce((m, s) => Math.max(m, s.streak ?? 0), 0) ?? 0,
              totalScore: scores?.reduce((s, r) => s + (r.score ?? 0), 0) ?? 0,
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

  const loading = progressLoading || statsLoading;
  const currentLevel = progress?.current_level ?? 1;
  const highestUnlocked = progress?.highest_level_unlocked ?? 1;
  const passRate = stats && stats.totalAttempts > 0
    ? Math.round((stats.totalPassed / stats.totalAttempts) * 100) : 0;
  const initials = (username ?? 'P').slice(0, 2).toUpperCase();

  return (
    <SafeAreaView testID="profile-screen" style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero header ── */}
        <LinearGradient
          colors={[COLORS.primaryGlow, 'transparent']}
          style={styles.heroGradient}
          pointerEvents="none"
        />
        <View style={styles.hero}>
          {/* Avatar */}
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.avatarGrad}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.username}>{username ?? t('playerDefault')}</Text>
          <View style={styles.levelBadge}>
            <Ionicons name="flash" size={13} color={COLORS.gold} />
            <Text style={styles.levelBadgeText}>{t('level')} {currentLevel}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* ── Stats grid ── */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionLabel}>{t('yourStats')}</Text>
              <View style={styles.statsGrid}>
                <StatCard icon="trophy"          iconColor={COLORS.gold}    value={`${currentLevel}`}                    label={t('level')} />
                <StatCard icon="checkmark-circle" iconColor={COLORS.success}  value={`${passRate}%`}                       label={t('passRate')} />
                <StatCard icon="flame"            iconColor={COLORS.streak}   value={`${stats?.bestStreak ?? 0}`}           label={t('bestStreak')} />
                <StatCard icon="star"             iconColor={COLORS.accent}   value={(stats?.totalScore ?? 0).toLocaleString()} label={t('totalScore')} />
                <StatCard icon="game-controller"  iconColor={COLORS.primary}  value={`${stats?.totalAttempts ?? 0}`}       label={t('gamesPlayed')} />
                <StatCard icon="rocket"           iconColor={COLORS.brandPurple} value={`${highestUnlocked}`}              label={t('highestLevel')} />
              </View>
            </View>

            {/* ── Achievements shortcut ── */}
            <TouchableOpacity
              style={styles.achievementsCard}
              onPress={() => navigation.navigate('Achievements')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#1D1840', '#271F58']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.achievementsGrad}
              >
                <View style={styles.achievementsLeft}>
                  <View style={[styles.achIcon, { backgroundColor: COLORS.gold + '22', borderColor: COLORS.gold + '44' }]}>
                    <Ionicons name="medal" size={24} color={COLORS.gold} />
                  </View>
                  <View>
                    <Text style={styles.achTitle}>{t('achievements')}</Text>
                    <Text style={styles.achSub}>
                      {highestUnlocked >= 5 ? t('earnedBadges') : t('startEarningBadges')}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gold + '88'} />
              </LinearGradient>
            </TouchableOpacity>

            {/* ── Language ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>{t('language').toUpperCase()}</Text>
              <View style={styles.langRow}>
                {(['en', 'tr'] as const).map(lang => (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.langBtn, language === lang && styles.langBtnActive]}
                    onPress={() => setLanguage(lang)}
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
                colors={['#2A1A00', '#3D2800']}
                style={styles.premiumCard}
              >
                <View style={[styles.premiumIcon, { backgroundColor: COLORS.gold + '22', borderColor: COLORS.gold + '44' }]}>
                  <Ionicons name="diamond" size={22} color={COLORS.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.premiumTitle}>{t('premiumUpgrade')}</Text>
                  <Text style={styles.premiumSub}>{t('unlimitedHeartsNoAds')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gold + '88'} />
              </LinearGradient>
            </TouchableOpacity>

            {/* ── Referral ── */}
            <TouchableOpacity
              style={styles.referralCard}
              onPress={() => navigation.navigate('Referral')}
              activeOpacity={0.85}
            >
              <Ionicons name="people" size={20} color={COLORS.accent} />
              <Text style={styles.referralText}>{t('referral')}</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  scroll: { paddingBottom: 40 },

  hero: { alignItems: 'center', paddingTop: 24, paddingBottom: 24, gap: 8 },
  avatarGrad: {
    width: 88, height: 88, borderRadius: 44,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8,
  },
  avatarInitials: { fontSize: 32, fontWeight: '900', color: '#fff' },
  username: { fontSize: 24, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.surface2, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.gold + '44',
  },
  levelBadgeText: { fontSize: 13, fontWeight: '800', color: COLORS.gold },

  statsSection: { paddingHorizontal: 16, marginBottom: 14 },
  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: COLORS.textMuted,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard: {
    width: '30.5%', backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 12, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statIconWrap: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },

  achievementsCard: { marginHorizontal: 16, marginBottom: 10, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  achievementsGrad: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  achievementsLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  achIcon: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  achTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  achSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  section: { paddingHorizontal: 16, marginBottom: 10 },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  langBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' },
  langFlag: { fontSize: 18 },
  langText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },

  premiumCard: {
    marginHorizontal: 16, marginBottom: 10, borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: COLORS.gold + '44',
  },
  premiumIcon: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  premiumTitle: { fontSize: 15, fontWeight: '800', color: COLORS.gold },
  premiumSub: { fontSize: 11, color: COLORS.gold + 'AA', marginTop: 2 },

  referralCard: {
    marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  referralText: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text },
});
