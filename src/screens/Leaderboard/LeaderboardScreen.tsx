import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet, View, ActivityIndicator, FlatList } from 'react-native';
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

const RANK_CONFIG: Record<number, {
  icon: string; color: string; glowColor: string;
  gradient: readonly [string, string]; size: number;
}> = {
  1: { icon: 'trophy', color: '#FDE047', glowColor: '#FDE047', gradient: ['#78350F', '#CA8A04'], size: 24 },
  2: { icon: 'medal',  color: '#CBD5E1', glowColor: '#CBD5E1', gradient: ['#334155', '#475569'], size: 20 },
  3: { icon: 'ribbon', color: '#FB923C', glowColor: '#FB923C', gradient: ['#431407', '#9A3412'], size: 18 },
};

// ─── Top-3 podium row ─────────────────────────────────────────────────────────
const PodiumRow: React.FC<{
  item: LeaderboardEntry; isMe: boolean;
  rc: typeof RANK_CONFIG[1]; delay: number;
}> = ({ item, isMe, rc, delay }) => {
  const { t } = useI18n();
  const slideAnim   = useRef(new Animated.Value(40)).current;
  const opacAnim    = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 480, delay, useNativeDriver: true }),
      Animated.timing(opacAnim,  { toValue: 1, duration: 360, delay: delay + 80, useNativeDriver: true }),
    ]).start();
    if (item.rank === 1) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, { toValue: 1.018, duration: 1800, useNativeDriver: true }),
          Animated.timing(breatheAnim, { toValue: 1,     duration: 1800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }, { scale: breatheAnim }], opacity: opacAnim }}>
      <View style={[
        styles.row,
        isMe && styles.rowMe,
        {
          borderColor: rc.color + '45',
          shadowColor: rc.glowColor,
          shadowOpacity: 0.30, shadowRadius: 14,
          shadowOffset: { width: 0, height: 0 }, elevation: 8,
        },
      ]}>
        {/* Rank gradient badge */}
        <LinearGradient colors={rc.gradient} style={styles.rankBadge}>
          <Ionicons name={rc.icon as any} size={rc.size} color={rc.color} />
        </LinearGradient>

        {/* Player */}
        <View style={styles.playerInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.username, isMe && styles.usernameMe, item.rank === 1 && { color: '#FDE047' }]}>
              {item.username}
            </Text>
            {isMe && <View style={styles.youBadge}><Text style={styles.youText}>YOU</Text></View>}
          </View>
          <Text style={styles.levelText}>
            <Ionicons name="flash" size={10} color={COLORS.gold} /> {t('level')} {item.level}
          </Text>
        </View>

        {/* Score */}
        <Text style={[styles.score, { color: rc.color }]}>
          {item.totalScore.toLocaleString()}
        </Text>
      </View>
    </Animated.View>
  );
};

// ─── Regular row ──────────────────────────────────────────────────────────────
const RegularRow: React.FC<{ item: LeaderboardEntry; isMe: boolean }> = ({ item, isMe }) => {
  const { t } = useI18n();
  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={styles.rankNum}>
        <Text style={styles.rankNumText}>{item.rank}</Text>
      </View>
      <View style={styles.playerInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.username, isMe && styles.usernameMe]}>{item.username}</Text>
          {isMe && <View style={styles.youBadge}><Text style={styles.youText}>YOU</Text></View>}
        </View>
        <Text style={styles.levelText}>
          <Ionicons name="flash" size={10} color={COLORS.gold} /> {t('level')} {item.level}
        </Text>
      </View>
      <Text style={styles.score}>{item.totalScore.toLocaleString()}</Text>
    </View>
  );
};

// ─── Trophy glow header ───────────────────────────────────────────────────────
const TrophyGlow: React.FC = () => {
  const glow = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.85, duration: 1600, useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0.4,  duration: 1600, useNativeDriver: false }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      shadowColor: '#FDE047', shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glow, shadowRadius: 22, elevation: 14,
    }}>
      <Ionicons name="trophy" size={44} color={COLORS.gold} />
    </Animated.View>
  );
};

export const LeaderboardScreen: React.FC = () => {
  const { t } = useI18n();
  const [entries, setEntries]             = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading]             = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled && user) setCurrentUserId(user.id);

        // Use the get_leaderboard RPC for efficient server-side aggregation
        const { data: rows, error } = await supabase.rpc('get_leaderboard', { p_limit: 50 });

        if (error || !rows) {
          if (!cancelled) setEntries([]);
          return;
        }

        const entries = (rows as Array<{
          rank: number;
          user_id: string;
          username: string;
          avatar_url: string | null;
          score: number;
          level: number;
        }>).map((row) => ({
          rank:       Number(row.rank),
          userId:     row.user_id,
          username:   row.username,
          totalScore: Number(row.score),
          level:      row.level,
        }));

        if (!cancelled) setEntries(entries);
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
    const rc   = RANK_CONFIG[item.rank];
    if (rc) {
      const delay = item.rank === 1 ? 200 : item.rank === 2 ? 100 : 0;
      return <PodiumRow item={item} isMe={isMe} rc={rc} delay={delay} />;
    }
    return <RegularRow item={item} isMe={isMe} />;
  };

  return (
    <SafeAreaView testID="leaderboard-screen" style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4F46E5', '#4338CA', '#3B35BC']} style={StyleSheet.absoluteFill} pointerEvents="none" />
      {/* Warm gold ambient band */}
      <LinearGradient
        colors={['rgba(253,224,71,0.10)', 'transparent']}
        style={styles.goldBand}
        pointerEvents="none"
      />

      {/* Header */}
      <View style={styles.header}>
        <TrophyGlow />
        <View>
          <Text style={styles.title}>{t('leaderboard')}</Text>
          <Text style={styles.subtitle}>{t('leaderboardSubtitle')}</Text>
        </View>
      </View>
      <View style={styles.divider} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>{t('loadingRankings')}</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="game-controller" size={60} color="rgba(255,255,255,0.3)" />
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
  goldBand: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 20 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 18,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13, color: 'rgba(255,255,255,0.48)', marginTop: 3,
  },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: {
    fontFamily: 'NunitoSans_600SemiBold',
    color: 'rgba(255,255,255,0.5)', fontSize: 15, marginTop: 8,
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20, fontWeight: '700', color: '#FFFFFF',
  },
  emptySubtitle: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 14, color: 'rgba(255,255,255,0.48)',
  },

  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 108, gap: 10 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18, paddingVertical: 14, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.13)',
  },
  rowMe: { borderColor: COLORS.primary, backgroundColor: 'rgba(253,224,71,0.10)' },

  rankBadge: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  rankNum: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.14)',
  },
  rankNumText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15, fontWeight: '800', color: 'rgba(255,255,255,0.55)',
  },

  playerInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 16, fontWeight: '700', color: '#FFFFFF',
  },
  usernameMe: { color: COLORS.primary },
  youBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
  },
  youText: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 9, fontWeight: '800', color: '#1E1B4B', letterSpacing: 0.5,
  },
  levelText: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3,
  },
  score: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18, fontWeight: '900', color: COLORS.primary,
    minWidth: 70, textAlign: 'right',
  },
});
