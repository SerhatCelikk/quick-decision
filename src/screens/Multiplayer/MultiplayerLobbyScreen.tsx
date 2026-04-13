import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

type Props = RootStackScreenProps<'MultiplayerLobby'>;

interface PlayerStats {
  elo: number;
  wins: number;
  losses: number;
  winStreak: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
}

interface RecentOpponent {
  username: string;
  result: 'win' | 'loss';
  eloChange: number;
}

function getRankFromElo(elo: number): PlayerStats['rank'] {
  if (elo >= 2000) return 'Diamond';
  if (elo >= 1500) return 'Gold';
  if (elo >= 1200) return 'Silver';
  return 'Bronze';
}

const RANK_COLORS: Record<PlayerStats['rank'], string> = {
  Bronze: '#cd7f32',
  Silver: '#aaa9ad',
  Gold: '#ffd700',
  Diamond: '#6ec6f5',
};

const RANK_EMOJI: Record<PlayerStats['rank'], string> = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Diamond: '💎',
};

export const MultiplayerLobbyScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useI18n();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [recentOpponents, setRecentOpponents] = useState<RecentOpponent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !cancelled) {
          const { data: mp } = await supabase
            .from('multiplayer_stats')
            .select('elo, wins, losses, win_streak')
            .eq('user_id', user.id)
            .single();

          const elo = mp?.elo ?? 1000;
          setStats({
            elo,
            wins: mp?.wins ?? 0,
            losses: mp?.losses ?? 0,
            winStreak: mp?.win_streak ?? 0,
            rank: getRankFromElo(elo),
          });

          const { data: recent } = await supabase
            .from('multiplayer_matches')
            .select('opponent_username, result, elo_change')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false })
            .limit(5);

          if (!cancelled && recent) {
            setRecentOpponents(
              recent.map((r: { opponent_username: string; result: string; elo_change: number }) => ({
                username: r.opponent_username,
                result: r.result as 'win' | 'loss',
                eloChange: r.elo_change,
              })),
            );
          }
        } else if (!cancelled) {
          setStats({ elo: 1000, wins: 0, losses: 0, winStreak: 0, rank: 'Bronze' });
        }
      } catch {
        if (!cancelled) {
          setStats({ elo: 1000, wins: 0, losses: 0, winStreak: 0, rank: 'Bronze' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const rank = stats?.rank ?? 'Bronze';

  return (
    <SafeAreaView style={styles.container}>
      {/* Rank header */}
      <View style={[styles.rankBanner, { borderColor: RANK_COLORS[rank] }]}>
        <Text style={styles.rankEmoji}>{RANK_EMOJI[rank]}</Text>
        <View>
          <Text style={[styles.rankLabel, { color: RANK_COLORS[rank] }]}>{rank}</Text>
          <Text style={styles.eloText}>{stats?.elo ?? 1000} {t('elo')}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
      ) : (
        <>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>{stats?.wins ?? 0}</Text>
              <Text style={styles.statLabel}>{t('wins')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.danger }]}>{stats?.losses ?? 0}</Text>
              <Text style={styles.statLabel}>{t('losses')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.warning }]}>{stats?.winStreak ?? 0}🔥</Text>
              <Text style={styles.statLabel}>{t('winStreak')}</Text>
            </View>
          </View>

          {/* Match buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Matchmaking')}
          >
            <Text style={styles.primaryButtonText}>⚔️  {t('quickMatch')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>👥  {t('challengeFriend')}</Text>
          </TouchableOpacity>

          {/* Recent opponents */}
          {recentOpponents.length > 0 && (
            <View style={styles.recentCard}>
              <Text style={styles.sectionTitle}>Recent Battles</Text>
              <FlatList
                data={recentOpponents}
                keyExtractor={(_, i) => String(i)}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.opponentRow}>
                    <Text style={styles.opponentName}>{item.username}</Text>
                    <Text style={[
                      styles.opponentResult,
                      { color: item.result === 'win' ? COLORS.success : COLORS.danger },
                    ]}>
                      {item.result === 'win' ? 'W' : 'L'}
                    </Text>
                    <Text style={[
                      styles.eloChange,
                      { color: item.eloChange >= 0 ? COLORS.success : COLORS.danger },
                    ]}>
                      {item.eloChange >= 0 ? '+' : ''}{item.eloChange}
                    </Text>
                  </View>
                )}
              />
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>⚡ Multiplayer matches don't cost energy. Play as many as you like!</Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20, paddingTop: 20 },
  rankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    gap: 12,
  },
  rankEmoji: { fontSize: 40 },
  rankLabel: { fontSize: 20, fontWeight: 'bold' },
  eloText: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 26, fontWeight: 'bold', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  recentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  opponentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  opponentName: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
  opponentResult: { fontSize: 16, fontWeight: '700', width: 24, textAlign: 'center' },
  eloChange: { fontSize: 13, fontWeight: '600', width: 40, textAlign: 'right' },
  infoCard: {
    backgroundColor: '#0c1a2e',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  infoText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
});
