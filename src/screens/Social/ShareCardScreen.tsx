import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants';
import { StreakCounter } from '../../components/StreakCounter';
import { getShareData, type ShareData } from '../../services/socialService';

// ─── The branded card ─────────────────────────────────────────────────────────

const ShareCard: React.FC<{ data: ShareData }> = ({ data }) => {
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  // Tier badge based on score
  function getTier(score: number): { label: string; color: string; emoji: string } {
    if (score >= 10_000) return { label: 'Legendary', color: '#FFD700', emoji: '👑' };
    if (score >= 5_000)  return { label: 'Elite', color: '#CE82FF', emoji: '💜' };
    if (score >= 1_000)  return { label: 'Pro', color: '#1CB0F6', emoji: '⚡' };
    return { label: 'Rising', color: '#58CC02', emoji: '🌱' };
  }

  const tier = getTier(data.totalScore);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
      {/* Top gradient stripe */}
      <View style={[styles.cardStripe, { backgroundColor: COLORS.primary }]} />

      {/* Logo row */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardLogo}>⚡ Quick Decision</Text>
        <View style={[styles.tierBadge, { borderColor: tier.color }]}>
          <Text style={styles.tierEmoji}>{tier.emoji}</Text>
          <Text style={[styles.tierLabel, { color: tier.color }]}>{tier.label}</Text>
        </View>
      </View>

      {/* Username */}
      <Text style={styles.cardUsername}>{data.username}</Text>
      <Text style={styles.cardTagline}>Think fast. Decide faster.</Text>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={[styles.statBig, { color: COLORS.primary }]}>
            {data.totalScore.toLocaleString()}
          </Text>
          <Text style={styles.statSub}>Total Score</Text>
        </View>
        <View style={[styles.statCell, styles.statCellMid]}>
          <Text style={[styles.statBig, { color: COLORS.brandGreen }]}>Lv {data.level}</Text>
          <Text style={styles.statSub}>Level</Text>
        </View>
        <View style={styles.statCell}>
          <View style={{ alignItems: 'center' }}>
            <StreakCounter streak={data.bestStreak} size="small" />
          </View>
          <Text style={styles.statSub}>Best Streak</Text>
        </View>
      </View>

      {/* Share code */}
      <View style={styles.codeSection}>
        <Text style={styles.codeSectionLabel}>Challenge me with code</Text>
        <Text style={styles.codeText}>{data.shareCode}</Text>
      </View>
    </Animated.View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export const ShareCardScreen: React.FC = () => {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShareData().then(setShareData).finally(() => setLoading(false));
  }, []);

  const handleShare = async () => {
    if (!shareData) return;
    try {
      await Share.share({
        message:
          `🎮 I'm playing Quick Decision!\n\n` +
          `👤 ${shareData.username}\n` +
          `⭐ Level ${shareData.level}\n` +
          `🏆 Score: ${shareData.totalScore.toLocaleString()}\n` +
          `🔥 Best Streak: ${shareData.bestStreak}\n\n` +
          `Challenge me with code: ${shareData.shareCode}\n` +
          `Download Quick Decision and beat my score!`,
        title: 'My Quick Decision Stats',
      });
    } catch {
      // user cancelled
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.heading}>Share Your Stats</Text>
        <Text style={styles.subheading}>Show off your progress!</Text>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 60 }} size="large" />
        ) : shareData ? (
          <>
            <ShareCard data={shareData} />
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>Share Card 📤</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.errorText}>Sign in to see your card</Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 16,
  },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.text, alignSelf: 'flex-start' },
  subheading: { fontSize: 14, color: COLORS.textMuted, alignSelf: 'flex-start', marginTop: -10 },

  // Card
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  cardStripe: { height: 5 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  cardLogo: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  tierEmoji: { fontSize: 13 },
  tierLabel: { fontSize: 12, fontWeight: '700' },
  cardUsername: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  cardTagline: {
    fontSize: 13,
    color: COLORS.textMuted,
    paddingHorizontal: 20,
    marginTop: 2,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCell: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  statCellMid: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  statBig: { fontSize: 22, fontWeight: '800' },
  statSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  codeSection: {
    margin: 20,
    padding: 14,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    alignItems: 'center',
    gap: 4,
  },
  codeSectionLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  codeText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 6,
  },

  // Share button
  shareBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  shareBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  errorText: { fontSize: 15, color: COLORS.textMuted, marginTop: 40 },
});
