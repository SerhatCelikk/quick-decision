import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

import type { TranslationKey } from '../../i18n';

interface Badge {
  id: string;
  key: string;
  nameKey: TranslationKey;
  descKey: TranslationKey;
  icon: string;
  iconColor: string;
  gradient: readonly [string, string];
  unlockedAt: string | null;
}

const BADGE_CATALOG: Omit<Badge, 'unlockedAt'>[] = [
  { id: 'first_win',      key: 'first_win',      icon: 'trophy',          iconColor: COLORS.gold,      gradient: ['#78350F', '#CA8A04'], nameKey: 'badge_first_win_name',      descKey: 'badge_first_win_desc' },
  { id: 'level_5',        key: 'level_5',        icon: 'star',            iconColor: '#FFB800',        gradient: ['#78350F', '#B45309'], nameKey: 'badge_level_5_name',         descKey: 'badge_level_5_desc' },
  { id: 'level_10',       key: 'level_10',       icon: 'star-half',       iconColor: COLORS.gold,      gradient: ['#78350F', '#CA8A04'], nameKey: 'badge_level_10_name',        descKey: 'badge_level_10_desc' },
  { id: 'streak_5',       key: 'streak_5',       icon: 'flame',           iconColor: COLORS.streak,    gradient: ['#7C2D12', '#C2410C'], nameKey: 'badge_streak_5_name',        descKey: 'badge_streak_5_desc' },
  { id: 'streak_10',      key: 'streak_10',      icon: 'flash',           iconColor: '#FF9100',        gradient: ['#7C2D12', '#EA580C'], nameKey: 'badge_streak_10_name',       descKey: 'badge_streak_10_desc' },
  { id: 'games_10',       key: 'games_10',       icon: 'game-controller', iconColor: COLORS.primary,   gradient: ['#4C1D95', '#7C3AED'], nameKey: 'badge_games_10_name',        descKey: 'badge_games_10_desc' },
  { id: 'games_50',       key: 'games_50',       icon: 'diamond',         iconColor: COLORS.accent,    gradient: ['#831843', '#BE185D'], nameKey: 'badge_games_50_name',        descKey: 'badge_games_50_desc' },
  { id: 'perfect_game',   key: 'perfect_game',   icon: 'checkmark-done',  iconColor: COLORS.success,   gradient: ['#166534', '#16A34A'], nameKey: 'badge_perfect_game_name',    descKey: 'badge_perfect_game_desc' },
  { id: 'speed_demon',    key: 'speed_demon',    icon: 'speedometer',     iconColor: '#FF5500',        gradient: ['#7C2D12', '#DC2626'], nameKey: 'badge_speed_demon_name',     descKey: 'badge_speed_demon_desc' },
  { id: 'multiplayer_1',  key: 'multiplayer_1',  icon: 'people',          iconColor: COLORS.timerSafe, gradient: ['#1E3A8A', '#1D4ED8'], nameKey: 'badge_multiplayer_1_name',   descKey: 'badge_multiplayer_1_desc' },
  { id: 'multiplayer_5w', key: 'multiplayer_5w', icon: 'medal',           iconColor: COLORS.gold,      gradient: ['#78350F', '#CA8A04'], nameKey: 'badge_multiplayer_5w_name',  descKey: 'badge_multiplayer_5w_desc' },
  { id: 'referral_1',     key: 'referral_1',     icon: 'git-network',     iconColor: COLORS.accent,    gradient: ['#831843', '#BE185D'], nameKey: 'badge_referral_1_name',      descKey: 'badge_referral_1_desc' },
  { id: 'spring_event',   key: 'spring_event',   icon: 'leaf',            iconColor: '#00C060',        gradient: ['#166534', '#16A34A'], nameKey: 'badge_spring_event_name',    descKey: 'badge_spring_event_desc' },
  { id: 'premium',        key: 'premium',        icon: 'diamond',         iconColor: COLORS.gold,      gradient: ['#78350F', '#B45309'], nameKey: 'badge_premium_name',         descKey: 'badge_premium_desc' },
  { id: 'turkish_mode',   key: 'turkish_mode',   icon: 'language',        iconColor: '#FF4444',        gradient: ['#7C2D12', '#DC2626'], nameKey: 'badge_turkish_mode_name',    descKey: 'badge_turkish_mode_desc' },
];

const BadgeCard: React.FC<{ item: Badge }> = ({ item }) => {
  const { t } = useI18n();
  const isUnlocked = item.unlockedAt !== null;
  const earnedDate = item.unlockedAt ? new Date(item.unlockedAt).toLocaleDateString() : null;
  const name = t(item.nameKey);
  const description = t(item.descKey);

  return (
    <View
      style={[styles.badge, isUnlocked ? styles.badgeUnlocked : styles.badgeLocked]}
      accessible
      accessibilityLabel={isUnlocked ? `${name}, ${t('earned')} ${earnedDate}` : `${name}, ${description}`}
    >
      {isUnlocked ? (
        <LinearGradient colors={item.gradient} style={styles.badgeGrad}>
          <View style={[styles.badgeIconCircle, { backgroundColor: item.iconColor + '22', borderColor: item.iconColor + '55' }]}>
            <Ionicons name={item.icon as any} size={28} color={item.iconColor} />
          </View>
          <Text style={styles.badgeName}>{name}</Text>
          <Text style={styles.badgeDesc} numberOfLines={2}>{description}</Text>
          <View style={styles.earnedRow}>
            <Ionicons name="checkmark-circle" size={10} color={COLORS.success} />
            <Text style={styles.earnedDate}>{earnedDate}</Text>
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.badgeGradLocked}>
          <View style={styles.badgeIconCircleLocked}>
            <Ionicons name="lock-closed" size={24} color="rgba(255,255,255,0.35)" />
          </View>
          <Text style={styles.badgeNameLocked}>{name}</Text>
          <Text style={styles.badgeDescLocked} numberOfLines={2}>{description}</Text>
        </View>
      )}
    </View>
  );
};

export const AchievementsScreen: React.FC = () => {
  const { t } = useI18n();
  const navigation = useNavigation();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadBadges = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('user_badges').select('badge_key, unlocked_at').eq('user_id', user.id);
        type Row = { badge_key: string; unlocked_at: string };
        const rows = (data ?? []) as Row[];
        setBadges(BADGE_CATALOG.map(b => {
          const u = rows.find(r => r.badge_key === b.key);
          return { ...b, unlockedAt: u?.unlocked_at ?? null } as Badge;
        }));
      } else {
        setBadges(BADGE_CATALOG.map(b => ({ ...b, unlockedAt: null } as Badge)));
      }
    } catch {
      setError(true);
      setBadges(BADGE_CATALOG.map(b => ({ ...b, unlockedAt: null } as Badge)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBadges(); }, [loadBadges]);

  const unlocked = badges.filter(b => b.unlockedAt !== null);
  const locked   = badges.filter(b => b.unlockedAt === null);
  const sorted   = [...unlocked, ...locked];
  const pct      = badges.length > 0 ? Math.round((unlocked.length / badges.length) * 100) : 0;

  if (loading) return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4F46E5', '#4338CA', '#3B35BC']} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <ActivityIndicator color={COLORS.gold} style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4F46E5', '#4338CA', '#3B35BC']} style={StyleSheet.absoluteFill} pointerEvents="none" />
      <TouchableOpacity onPress={loadBadges} style={styles.errorWrap}>
        <Ionicons name="refresh-circle" size={48} color={COLORS.textMuted} />
        <Text style={styles.errorText}>{t('errorRetry')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4F46E5', '#4338CA', '#3B35BC']} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('goBack')}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t('achievements')}</Text>
        {/* Progress ring */}
        <View style={styles.progressRing}>
          <Text style={styles.progressPct}>{pct}%</Text>
        </View>
      </View>

      {/* Sub-header */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>{unlocked.length} / {badges.length} {t('unlockedLabel')}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${pct}%` as `${number}%` }]} />
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <BadgeCard item={item} />}
        ListEmptyComponent={<Text style={styles.empty}>{t('noAchievementsYet')}</Text>}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  navBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, gap: 8,
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
  progressRing: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 2, borderColor: COLORS.gold + '88',
    justifyContent: 'center', alignItems: 'center',
  },
  progressPct: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, fontWeight: '900', color: COLORS.gold },

  subHeader: { paddingHorizontal: 20, paddingBottom: 14, gap: 6 },
  subHeaderText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 13, color: COLORS.textMuted },
  progressBar: {
    height: 5, backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 3 },

  grid: { paddingHorizontal: 12, paddingBottom: 32 },
  row:  { gap: 8, marginBottom: 8 },

  badge: {
    flex: 1, borderRadius: 18, overflow: 'hidden', borderWidth: 1,
    minHeight: 160,
  },
  badgeUnlocked: { borderColor: 'rgba(255,255,255,0.18)' },
  badgeLocked:   { borderColor: 'rgba(255,255,255,0.08)', opacity: 0.65 },

  badgeGrad: {
    flex: 1, padding: 14, alignItems: 'center', gap: 6, justifyContent: 'center',
  },
  badgeGradLocked: {
    flex: 1, padding: 14, alignItems: 'center', gap: 6, justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  badgeIconCircle: {
    width: 52, height: 52, borderRadius: 16, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  badgeIconCircleLocked: {
    width: 52, height: 52, borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  badgeName:       { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 12, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  badgeDesc:       { fontFamily: 'NunitoSans_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 14 },
  badgeNameLocked: { fontFamily: 'NunitoSans_700Bold', fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textAlign: 'center' },
  badgeDescLocked: { fontFamily: 'NunitoSans_400Regular', fontSize: 10, color: COLORS.textMuted, textAlign: 'center', lineHeight: 14 },
  earnedRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  earnedDate: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 9, color: COLORS.success, fontWeight: '600' },

  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontFamily: 'NunitoSans_600SemiBold', color: COLORS.textMuted, textAlign: 'center', fontSize: 15 },
  empty: { fontFamily: 'NunitoSans_600SemiBold', textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 15 },
});
