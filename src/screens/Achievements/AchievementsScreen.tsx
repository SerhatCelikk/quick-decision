import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

interface Badge {
  id: string;
  key: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt: string | null;
}

const BADGE_CATALOG: Omit<Badge, 'unlockedAt'>[] = [
  { id: 'first_win',      key: 'first_win',      emoji: '🏆', name: 'First Win',         description: 'Pass your first level' },
  { id: 'level_5',        key: 'level_5',        emoji: '⭐', name: 'Level 5',            description: 'Reach level 5' },
  { id: 'level_10',       key: 'level_10',       emoji: '🌟', name: 'Level 10',           description: 'Reach level 10' },
  { id: 'streak_5',       key: 'streak_5',       emoji: '🔥', name: 'On Fire',            description: 'Achieve a 5x answer streak' },
  { id: 'streak_10',      key: 'streak_10',      emoji: '⚡', name: 'Unstoppable',        description: 'Achieve a 10x answer streak' },
  { id: 'games_10',       key: 'games_10',       emoji: '🎯', name: 'Dedicated',          description: 'Play 10 games' },
  { id: 'games_50',       key: 'games_50',       emoji: '💎', name: 'Veteran',            description: 'Play 50 games' },
  { id: 'perfect_game',   key: 'perfect_game',   emoji: '✨', name: 'Perfectionist',      description: 'Get 100% accuracy in a game' },
  { id: 'speed_demon',    key: 'speed_demon',    emoji: '🚀', name: 'Speed Demon',        description: 'Answer 5 questions in under 2s each' },
  { id: 'multiplayer_1',  key: 'multiplayer_1',  emoji: '⚔️', name: 'First Battle',       description: 'Complete your first multiplayer match' },
  { id: 'multiplayer_5w', key: 'multiplayer_5w', emoji: '🥇', name: 'Champion',           description: 'Win 5 multiplayer matches' },
  { id: 'referral_1',     key: 'referral_1',     emoji: '🤝', name: 'Recruiter',          description: 'Invite a friend who joins' },
  { id: 'spring_event',   key: 'spring_event',   emoji: '🌸', name: 'Spring Scholar',     description: 'Complete Spring Knowledge Sprint' },
  { id: 'premium',        key: 'premium',        emoji: '👑', name: 'Premium Member',     description: 'Subscribe to Quick Decision Premium' },
  { id: 'turkish_mode',   key: 'turkish_mode',   emoji: '🇹🇷', name: 'Bilingual',         description: 'Play in Turkish mode' },
];

export const AchievementsScreen: React.FC = () => {
  const { t } = useI18n();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadBadges = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let unlockedKeys: string[] = [];

      if (user) {
        const { data } = await supabase
          .from('user_badges')
          .select('badge_key, unlocked_at')
          .eq('user_id', user.id);
        type BadgeRow = { badge_key: string; unlocked_at: string };
        const rows = (data ?? []) as BadgeRow[];
        unlockedKeys = rows.map((r) => r.badge_key);

        // Map unlocked times
        const merged: Badge[] = BADGE_CATALOG.map((b) => {
          const unlocked = rows.find((r) => r.badge_key === b.key);
          return { ...b, unlockedAt: unlocked?.unlocked_at ?? null };
        });
        setBadges(merged);
      } else {
        setBadges(BADGE_CATALOG.map((b) => ({ ...b, unlockedAt: null })));
      }
    } catch {
      setError(true);
      setBadges(BADGE_CATALOG.map((b) => ({ ...b, unlockedAt: null })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBadges(); }, [loadBadges]);

  const unlocked = badges.filter((b) => b.unlockedAt !== null);
  const locked = badges.filter((b) => b.unlockedAt === null);
  const sorted = [...unlocked, ...locked];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={loadBadges} style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('errorRetry')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('achievements')}</Text>
        <Text style={styles.subtitle}>
          {unlocked.length} / {badges.length} unlocked
        </Text>
      </View>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={[styles.badge, item.unlockedAt ? styles.badgeUnlocked : styles.badgeLocked]}>
            <Text style={[styles.badgeEmoji, !item.unlockedAt && styles.badgeEmojiLocked]}>
              {item.unlockedAt ? item.emoji : '🔒'}
            </Text>
            <Text style={[styles.badgeName, !item.unlockedAt && styles.badgeNameLocked]}>
              {item.name}
            </Text>
            <Text style={styles.badgeDesc} numberOfLines={2}>
              {item.description}
            </Text>
            {item.unlockedAt && (
              <Text style={styles.badgeDate}>
                {new Date(item.unlockedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('noAchievementsYet')}</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  badge: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  badgeUnlocked: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
  },
  badgeLocked: {
    backgroundColor: '#0a1020',
    borderColor: COLORS.border,
    opacity: 0.7,
  },
  badgeEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  badgeEmojiLocked: {
    opacity: 0.4,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: COLORS.textMuted,
  },
  badgeDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
  badgeDate: {
    fontSize: 10,
    color: COLORS.primary,
    marginTop: 6,
  },
  empty: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: 40,
    fontSize: 15,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    fontSize: 15,
  },
});
