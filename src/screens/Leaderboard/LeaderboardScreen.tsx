import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalScore: number;
  level: number;
}

const RANK_EMOJI: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export const LeaderboardScreen: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled && user) setCurrentUserId(user.id);

        // Aggregate total score per user from scores table
        const { data: scores } = await supabase
          .from('scores')
          .select('user_id, score');

        // Aggregate scores by user
        const scoreMap: Record<string, number> = {};
        for (const s of scores ?? []) {
          scoreMap[s.user_id] = (scoreMap[s.user_id] ?? 0) + (s.score ?? 0);
        }

        // Sort by total score descending, take top 20
        const topUsers = Object.entries(scoreMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20);

        if (topUsers.length === 0) {
          if (!cancelled) {
            setEntries([]);
            setLoading(false);
          }
          return;
        }

        const userIds = topUsers.map(([id]) => id);

        // Fetch usernames
        const { data: users } = await supabase
          .from('users')
          .select('id, username')
          .in('id', userIds);

        // Fetch highest levels
        const { data: progress } = await supabase
          .from('user_progress')
          .select('user_id, highest_level_unlocked')
          .in('user_id', userIds);

        const usernameMap: Record<string, string> = {};
        for (const u of users ?? []) usernameMap[u.id] = u.username;

        const levelMap: Record<string, number> = {};
        for (const p of progress ?? []) levelMap[p.user_id] = p.highest_level_unlocked;

        const result: LeaderboardEntry[] = topUsers.map(([userId, totalScore], idx) => ({
          rank: idx + 1,
          userId,
          username: usernameMap[userId] ?? 'Player',
          totalScore,
          level: levelMap[userId] ?? 1,
        }));

        if (!cancelled) setEntries(result);
      } catch {
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLeaderboard();
    return () => { cancelled = true; };
  }, []);

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isMe = item.userId === currentUserId;
    return (
      <View style={[styles.row, isMe && styles.rowHighlight]}>
        <Text style={styles.rank}>
          {RANK_EMOJI[item.rank] ?? `${item.rank}.`}
        </Text>
        <View style={styles.userInfo}>
          <Text style={[styles.username, isMe && styles.usernameMe]}>
            {item.username}{isMe ? ' (You)' : ''}
          </Text>
          <Text style={styles.level}>Level {item.level}</Text>
        </View>
        <Text style={styles.score}>{item.totalScore.toLocaleString()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView testID="leaderboard-screen" style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>
      <Text style={styles.subtitle}>Top players by total score</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading rankings…</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🎮</Text>
          <Text style={styles.emptyTitle}>No scores yet</Text>
          <Text style={styles.emptySubtitle}>Play some games to appear here!</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.userId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 15,
    marginTop: 8,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowHighlight: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  rank: {
    fontSize: 20,
    width: 40,
    textAlign: 'center',
    color: COLORS.text,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  usernameMe: {
    color: '#a5b4fc',
  },
  level: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  separator: {
    height: 8,
  },
});
