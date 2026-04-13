import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalScore: number;
  level: number;
}

// Podium rank config
const RANK_CONFIG: Record<number, { icon: string; color: string; bg: string; size: number }> = {
  1: { icon: 'trophy',  color: '#FFD700', bg: '#2A2000', size: 24 },
  2: { icon: 'medal',   color: '#C0C0C0', bg: '#1A1A1A', size: 20 },
  3: { icon: 'ribbon',  color: '#CD7F32', bg: '#1E1008', size: 18 },
};

export const LeaderboardScreen: React.FC = () => {
  const { t } = useI18n();
  const [entries, setEntries]         = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading]         = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled && user) setCurrentUserId(user.id);

        const { data: scores } = await supabase.from('scores').select('user_id, score');
        const scoreMap: Record<string, number> = {};
        for (const s of scores ?? []) scoreMap[s.user_id] = (scoreMap[s.user_id] ?? 0) + (s.score ?? 0);
        const topUsers = Object.entries(scoreMap).sort(([, a], [, b]) => b - a).slice(0, 20);
        if (!topUsers.length) { if (!cancelled) { setEntries([]); setLoading(false); } return; }

        const userIds = topUsers.map(([id]) => id);
        const { data: users } = await supabase.from('users').select('id, username').in('id', userIds);
        const { data: prog }  = await supabase.from('user_progress').select('user_id, highest_level_unlocked').in('user_id', userIds);

        const usernameMap: Record<string, string> = {};
        for (const u of users ?? []) usernameMap[u.id] = u.username;
        const levelMap: Record<string, number> = {};
        for (const p of prog ?? []) levelMap[p.user_id] = p.highest_level_unlocked;

        if (!cancelled) {
          setEntries(topUsers.map(([userId, totalScore], idx) => ({
            rank: idx + 1, userId, totalScore,
            username: usernameMap[userId] ?? 'Player',
            level: levelMap[userId] ?? 1,
          })));
        }
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isMe = item.userId === currentUserId;
    const rc = RANK_CONFIG[item.rank];

    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        {/* Rank */}
        {rc ? (
          <View style={[styles.rankIcon, { backgroundColor: rc.bg }]}>
            <Ionicons name={rc.icon as any} size={rc.size} color={rc.color} />
          </View>
        ) : (
          <View style={styles.rankNumWrap}>
            <Text style={styles.rankNum}>{item.rank}</Text>
          </View>
        )}

        {/* Player info */}
        <View style={styles.playerInfo}>
          <View style={styles.usernameRow}>
            <Text style={[styles.username, isMe && styles.usernameMe]}>
              {item.username}
            </Text>
            {isMe && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>YOU</Text>
              </View>
            )}
          </View>
          <Text style={styles.levelText}>
            <Ionicons name="flash" size={10} color={COLORS.gold} /> {t('level')} {item.level}
          </Text>
        </View>

        {/* Score */}
        <Text style={[styles.score, rc && { color: rc.color }]}>
          {item.totalScore.toLocaleString()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView testID="leaderboard-screen" style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#2A2000', 'transparent']}
        style={styles.headerGrad}
        pointerEvents="none"
      />
      <View style={styles.header}>
        <Ionicons name="trophy" size={32} color={COLORS.gold} />
        <View>
          <Text style={styles.title}>{t('leaderboard')}</Text>
          <Text style={styles.subtitle}>{t('leaderboardSubtitle')}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>{t('loadingRankings')}</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="game-controller" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>{t('noScoresYet')}</Text>
          <Text style={styles.emptySubtitle}>{t('playSomeGames')}</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.userId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerGrad: { position: 'absolute', top: 0, left: 0, right: 0, height: 150 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: COLORS.textMuted, fontSize: 15, marginTop: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textMuted },

  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 8 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  rowMe: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },

  rankIcon: {
    width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  rankNumWrap: {
    width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border,
  },
  rankNum: { fontSize: 15, fontWeight: '800', color: COLORS.textSecondary },

  playerInfo: { flex: 1 },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  usernameMe: { color: COLORS.primary },
  youBadge: {
    backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  youBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  levelText: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },

  score: { fontSize: 17, fontWeight: '900', color: COLORS.primary, minWidth: 70, textAlign: 'right' },
});
