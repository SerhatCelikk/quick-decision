import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
  { id: 'first_win',      key: 'first_win',      icon: 'trophy',          iconColor: COLORS.gold,      gradient: ['#2A2000', '#3D3000'], nameKey: 'badge_first_win_name',      descKey: 'badge_first_win_desc' },
  { id: 'level_5',        key: 'level_5',        icon: 'star',            iconColor: '#FFB800',        gradient: ['#2A1A00', '#3D2800'], nameKey: 'badge_level_5_name',         descKey: 'badge_level_5_desc' },
  { id: 'level_10',       key: 'level_10',       icon: 'star-half',       iconColor: COLORS.gold,      gradient: ['#2A2000', '#3D3000'], nameKey: 'badge_level_10_name',        descKey: 'badge_level_10_desc' },
  { id: 'streak_5',       key: 'streak_5',       icon: 'flame',           iconColor: COLORS.streak,    gradient: ['#2A0E00', '#3D1500'], nameKey: 'badge_streak_5_name',        descKey: 'badge_streak_5_desc' },
  { id: 'streak_10',      key: 'streak_10',      icon: 'flash',           iconColor: '#FF9100',        gradient: ['#2A1500', '#3D2000'], nameKey: 'badge_streak_10_name',       descKey: 'badge_streak_10_desc' },
  { id: 'games_10',       key: 'games_10',       icon: 'game-controller', iconColor: COLORS.primary,   gradient: ['#200010', '#300018'], nameKey: 'badge_games_10_name',        descKey: 'badge_games_10_desc' },
  { id: 'games_50',       key: 'games_50',       icon: 'diamond',         iconColor: COLORS.accent,    gradient: ['#001820', '#002530'], nameKey: 'badge_games_50_name',        descKey: 'badge_games_50_desc' },
  { id: 'perfect_game',   key: 'perfect_game',   icon: 'checkmark-done',  iconColor: COLORS.success,   gradient: ['#00200E', '#003015'], nameKey: 'badge_perfect_game_name',    descKey: 'badge_perfect_game_desc' },
  { id: 'speed_demon',    key: 'speed_demon',    icon: 'speedometer',     iconColor: '#FF5500',        gradient: ['#200800', '#301200'], nameKey: 'badge_speed_demon_name',     descKey: 'badge_speed_demon_desc' },
  { id: 'multiplayer_1',  key: 'multiplayer_1',  icon: 'people',          iconColor: COLORS.timerSafe, gradient: ['#001525', '#002038'], nameKey: 'badge_multiplayer_1_name',   descKey: 'badge_multiplayer_1_desc' },
  { id: 'multiplayer_5w', key: 'multiplayer_5w', icon: 'medal',           iconColor: COLORS.gold,      gradient: ['#2A2000', '#3D3000'], nameKey: 'badge_multiplayer_5w_name',  descKey: 'badge_multiplayer_5w_desc' },
  { id: 'referral_1',     key: 'referral_1',     icon: 'git-network',     iconColor: COLORS.accent,    gradient: ['#001820', '#002530'], nameKey: 'badge_referral_1_name',      descKey: 'badge_referral_1_desc' },
  { id: 'spring_event',   key: 'spring_event',   icon: 'leaf',            iconColor: '#00C060',        gradient: ['#00200E', '#003015'], nameKey: 'badge_spring_event_name',    descKey: 'badge_spring_event_desc' },
  { id: 'premium',        key: 'premium',        icon: 'diamond',         iconColor: COLORS.gold,      gradient: ['#2A1A00', '#3D2800'], nameKey: 'badge_premium_name',         descKey: 'badge_premium_desc' },
  { id: 'turkish_mode',   key: 'turkish_mode',   icon: 'language',        iconColor: '#FF4444',        gradient: ['#200010', '#300018'], nameKey: 'badge_turkish_mode_name',    descKey: 'badge_turkish_mode_desc' },
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
        <View style={styles.badgeGrad}>
          <View style={[styles.badgeIconCircle, { backgroundColor: COLORS.border + '50', borderColor: COLORS.border }]}>
            <Ionicons name="lock-closed" size={24} color={COLORS.textMuted} />
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
    <SafeAreaView style={styles.container}>
      <ActivityIndicator color={COLORS.gold} style={{ marginTop: 60 }} />
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={loadBadges} style={styles.errorWrap}>
        <Ionicons name="refresh-circle" size={48} color={COLORS.textMuted} />
        <Text style={styles.errorText}>{t('errorRetry')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#2A2000', 'transparent']} style={styles.headerGrad} pointerEvents="none" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{t('achievements')}</Text>
          <Text style={styles.subtitle}>{unlocked.length} / {badges.length} {t('unlockedLabel')}</Text>
        </View>
        {/* Progress ring indicator */}
        <View style={styles.progressRing}>
          <Text style={styles.progressPct}>{pct}%</Text>
          <Text style={styles.progressLabel}>{t('doneLabel')}</Text>
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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerGrad: { position: 'absolute', top: 0, left: 0, right: 0, height: 140 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  headerLeft: { gap: 2 },
  title:    { fontSize: 26, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  progressRing: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.surface, borderWidth: 2, borderColor: COLORS.gold + '66',
    justifyContent: 'center', alignItems: 'center',
  },
  progressPct:   { fontSize: 14, fontWeight: '900', color: COLORS.gold },
  progressLabel: { fontSize: 8, color: COLORS.textMuted, fontWeight: '600' },

  grid: { paddingHorizontal: 12, paddingBottom: 32 },
  row:  { gap: 8, marginBottom: 8 },

  badge: {
    flex: 1, borderRadius: 18, overflow: 'hidden', borderWidth: 1,
    minHeight: 160,
  },
  badgeUnlocked: { borderColor: COLORS.border },
  badgeLocked:   { borderColor: COLORS.surface3, opacity: 0.6 },

  badgeGrad: {
    flex: 1, padding: 14, alignItems: 'center', gap: 6,
    justifyContent: 'center', backgroundColor: COLORS.surface,
  },
  badgeIconCircle: {
    width: 52, height: 52, borderRadius: 16, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  badgeName:      { fontSize: 12, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  badgeDesc:      { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 14 },
  badgeNameLocked:{ fontSize: 12, fontWeight: '700', color: COLORS.textMuted, textAlign: 'center' },
  badgeDescLocked:{ fontSize: 10, color: COLORS.lockedText, textAlign: 'center', lineHeight: 14 },
  earnedRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  earnedDate: { fontSize: 9, color: COLORS.success, fontWeight: '600' },

  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: COLORS.textMuted, textAlign: 'center', fontSize: 15 },
  empty: { textAlign: 'center', color: COLORS.textMuted, marginTop: 40, fontSize: 15 },
});
