import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { useLevelProgress } from '../../hooks/useLevelProgress';
import { COLORS } from '../../constants';

interface UserStats {
  totalAttempts: number;
  totalPassed: number;
  bestStreak: number;
  totalScore: number;
}

export const ProfileScreen: React.FC = () => {
  const { progress, loading: progressLoading } = useLevelProgress();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setStatsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user && !cancelled) {
          // Fetch username
          const { data: userData } = await supabase
            .from('users')
            .select('username')
            .eq('id', user.id)
            .single();
          if (!cancelled && userData) setUsername(userData.username);

          // Fetch level attempt stats
          const { data: attempts } = await supabase
            .from('level_attempts')
            .select('passed')
            .eq('user_id', user.id);

          // Fetch best streak and total score
          const { data: scores } = await supabase
            .from('scores')
            .select('score, streak')
            .eq('user_id', user.id);

          if (!cancelled) {
            const totalAttempts = attempts?.length ?? 0;
            const totalPassed = attempts?.filter(a => a.passed).length ?? 0;
            const bestStreak = scores?.reduce((max, s) => Math.max(max, s.streak ?? 0), 0) ?? 0;
            const totalScore = scores?.reduce((sum, s) => sum + (s.score ?? 0), 0) ?? 0;
            setStats({ totalAttempts, totalPassed, bestStreak, totalScore });
          }
        } else if (!cancelled) {
          // Guest user — show defaults
          setStats({ totalAttempts: 0, totalPassed: 0, bestStreak: 0, totalScore: 0 });
        }
      } catch {
        if (!cancelled) {
          setStats({ totalAttempts: 0, totalPassed: 0, bestStreak: 0, totalScore: 0 });
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    loadStats();
    return () => { cancelled = true; };
  }, []);

  const loading = progressLoading || statsLoading;
  const currentLevel = progress?.current_level ?? 1;
  const highestUnlocked = progress?.highest_level_unlocked ?? 1;
  const passRate = stats && stats.totalAttempts > 0
    ? Math.round((stats.totalPassed / stats.totalAttempts) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.username}>{username ?? 'Player'}</Text>
          <Text style={styles.subtitle}>Quick Decision Player</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
        ) : (
          <>
            {/* Level Progress Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Level Progress</Text>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{currentLevel}</Text>
                  <Text style={styles.statLabel}>Current Level</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{highestUnlocked}</Text>
                  <Text style={styles.statLabel}>Highest Unlocked</Text>
                </View>
              </View>
            </View>

            {/* Game Stats Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Game Stats</Text>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats?.totalAttempts ?? 0}</Text>
                  <Text style={styles.statLabel}>Attempts</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#22c55e' }]}>{passRate}%</Text>
                  <Text style={styles.statLabel}>Pass Rate</Text>
                </View>
              </View>
              <View style={[styles.statRow, { marginTop: 16 }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#f97316' }]}>
                    {stats?.bestStreak ?? 0}🔥
                  </Text>
                  <Text style={styles.statLabel}>Best Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#a5b4fc' }]}>
                    {(stats?.totalScore ?? 0).toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Total Score</Text>
                </View>
              </View>
            </View>

            {/* Achievements placeholder */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Achievements</Text>
              {highestUnlocked >= 5 && (
                <View style={styles.achievementRow}>
                  <Text style={styles.achievementEmoji}>⭐</Text>
                  <Text style={styles.achievementText}>Reached Level 5</Text>
                </View>
              )}
              {(stats?.bestStreak ?? 0) >= 5 && (
                <View style={styles.achievementRow}>
                  <Text style={styles.achievementEmoji}>🔥</Text>
                  <Text style={styles.achievementText}>5x Streak Master</Text>
                </View>
              )}
              {(stats?.totalAttempts ?? 0) >= 10 && (
                <View style={styles.achievementRow}>
                  <Text style={styles.achievementEmoji}>🎯</Text>
                  <Text style={styles.achievementText}>10 Games Played</Text>
                </View>
              )}
              {highestUnlocked < 5 && (stats?.bestStreak ?? 0) < 5 && (stats?.totalAttempts ?? 0) < 10 && (
                <Text style={styles.noAchievements}>Keep playing to earn achievements!</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  achievementEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  achievementText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  noAchievements: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
