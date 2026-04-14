import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../../types';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

type Props = RootStackScreenProps<'MultiplayerLobby'>;

interface PlayerStats {
  elo: number; wins: number; losses: number; winStreak: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
}
interface RecentOpponent { username: string; result: 'win' | 'loss'; eloChange: number }

function getRankFromElo(elo: number): PlayerStats['rank'] {
  if (elo >= 2000) return 'Diamond';
  if (elo >= 1500) return 'Gold';
  if (elo >= 1200) return 'Silver';
  return 'Bronze';
}

const RANK_CONFIG: Record<PlayerStats['rank'], { color: string; icon: string; gradient: readonly [string, string] }> = {
  Bronze:  { color: '#CD7F32', icon: 'ribbon',  gradient: ['#78350F', '#92400E'] },
  Silver:  { color: '#C0C0C0', icon: 'medal',   gradient: ['#334155', '#475569'] },
  Gold:    { color: '#FFD700', icon: 'trophy',  gradient: ['#78350F', '#CA8A04'] },
  Diamond: { color: '#6EC6F5', icon: 'diamond', gradient: ['#1E3A8A', '#1D4ED8'] },
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
          const { data: mp } = await supabase.from('multiplayer_stats')
            .select('elo, wins, losses, win_streak').eq('user_id', user.id).single();
          const elo = mp?.elo ?? 1000;
          setStats({ elo, wins: mp?.wins ?? 0, losses: mp?.losses ?? 0, winStreak: mp?.win_streak ?? 0, rank: getRankFromElo(elo) });
          const { data: recent } = await supabase.from('multiplayer_matches')
            .select('opponent_username, result, elo_change').eq('user_id', user.id)
            .order('completed_at', { ascending: false }).limit(5);
          if (!cancelled && recent) {
            setRecentOpponents(recent.map((r: any) => ({ username: r.opponent_username, result: r.result, eloChange: r.elo_change })));
          }
        } else if (!cancelled) {
          setStats({ elo: 1000, wins: 0, losses: 0, winStreak: 0, rank: 'Bronze' });
        }
      } catch {
        if (!cancelled) setStats({ elo: 1000, wins: 0, losses: 0, winStreak: 0, rank: 'Bronze' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const rank = stats?.rank ?? 'Bronze';
  const rc = RANK_CONFIG[rank];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4F46E5', '#4338CA', '#3B35BC']} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('goBack')}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t('multiplayerTitle')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Rank banner */}
      <LinearGradient colors={rc.gradient} style={styles.rankBanner}>
        <View style={[styles.rankIconWrap, { borderColor: rc.color + '55', backgroundColor: rc.color + '20' }]}>
          <Ionicons name={rc.icon as any} size={36} color={rc.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rankLabel, { color: rc.color }]}>{rank}</Text>
          <Text style={styles.eloText}>{stats?.elo ?? 1000} ELO</Text>
        </View>
        <View style={[styles.eloBadge, { borderColor: rc.color + '44' }]}>
          <Ionicons name="trending-up" size={14} color={rc.color} />
          <Text style={[styles.eloRank, { color: rc.color }]}>{rank}</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
      ) : (
        <View style={styles.content}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={[styles.statValue, { color: COLORS.success }]}>{stats?.wins ?? 0}</Text>
              <Text style={styles.statLabel}>{t('wins')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="close-circle" size={18} color={COLORS.danger} />
              <Text style={[styles.statValue, { color: COLORS.danger }]}>{stats?.losses ?? 0}</Text>
              <Text style={styles.statLabel}>{t('losses')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="flame" size={18} color={COLORS.streak} />
              <Text style={[styles.statValue, { color: COLORS.streak }]}>{stats?.winStreak ?? 0}</Text>
              <Text style={styles.statLabel}>{t('winStreak')}</Text>
            </View>
          </View>

          {/* Match buttons */}
          <TouchableOpacity style={styles.primaryBtnWrap} onPress={() => navigation.navigate('Matchmaking')} activeOpacity={0.88}>
            <LinearGradient colors={['#FEF08A', '#FDE047']} style={styles.primaryBtn}>
              <Ionicons name="flash" size={22} color="#1E1B4B" />
              <Text style={styles.primaryBtnText}>{t('quickMatch')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85}>
            <Ionicons name="people" size={20} color={COLORS.accent} />
            <Text style={styles.secondaryBtnText}>{t('challengeFriend')}</Text>
          </TouchableOpacity>

          {/* Recent opponents */}
          {recentOpponents.length > 0 && (
            <View style={styles.recentCard}>
              <Text style={styles.sectionTitle}>{t('recentBattles')}</Text>
              {recentOpponents.map((item, i) => (
                <View key={i} style={[styles.opponentRow, i < recentOpponents.length - 1 && styles.opponentRowBorder]}>
                  <Ionicons name="person-circle" size={28} color={COLORS.textMuted} />
                  <Text style={styles.opponentName}>{item.username}</Text>
                  <View style={[styles.resultBadge, { backgroundColor: item.result === 'win' ? COLORS.successBg : COLORS.dangerBg }]}>
                    <Text style={[styles.resultText, { color: item.result === 'win' ? COLORS.success : COLORS.danger }]}>
                      {item.result === 'win' ? 'WIN' : 'LOSS'}
                    </Text>
                  </View>
                  <Text style={[styles.eloChange, { color: item.eloChange >= 0 ? COLORS.success : COLORS.danger }]}>
                    {item.eloChange >= 0 ? '+' : ''}{item.eloChange}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Info */}
          <View style={styles.infoCard}>
            <Ionicons name="flash" size={14} color={COLORS.timerSafe} />
            <Text style={styles.infoText}>{t('multiplayerFreeInfo')}</Text>
          </View>
        </View>
      )}
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

  rankBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 16,
    marginHorizontal: 16, borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  rankIconWrap: {
    width: 56, height: 56, borderRadius: 18, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  rankLabel: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  eloText: { fontFamily: 'NunitoSans_400Regular', fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  eloBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  eloRank: { fontFamily: 'NunitoSans_700Bold', fontSize: 11, fontWeight: '700' },

  content: { flex: 1, paddingHorizontal: 16, paddingTop: 14, gap: 12 },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 18,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.14)' },
  statValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, fontWeight: '900' },
  statLabel: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  primaryBtnWrap: {
    borderRadius: 18, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 6,
  },
  primaryBtn: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryBtnText: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 18, fontWeight: '800', color: '#1E1B4B' },

  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 16, height: 52,
    borderWidth: 1.5, borderColor: COLORS.accent + '55',
  },
  secondaryBtnText: { fontFamily: 'NunitoSans_700Bold', fontSize: 16, fontWeight: '700', color: COLORS.text },

  recentCard: {
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', gap: 4,
  },
  sectionTitle: { fontFamily: 'NunitoSans_700Bold', fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: 8, textTransform: 'uppercase' },
  opponentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  opponentRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.10)' },
  opponentName: { flex: 1, fontFamily: 'NunitoSans_600SemiBold', fontSize: 14, color: COLORS.text, fontWeight: '600' },
  resultBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  resultText: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 11, fontWeight: '800' },
  eloChange: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, fontWeight: '700', minWidth: 36, textAlign: 'right' },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.timerSafe + '30',
  },
  infoText: { flex: 1, fontFamily: 'NunitoSans_400Regular', fontSize: 12, color: COLORS.textMuted, lineHeight: 17 },
});
