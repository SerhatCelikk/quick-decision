import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

interface ReferralData {
  code: string;
  successfulReferrals: number;
  pendingReferrals: number;
  coinsEarned: number;
}

function generateCode(userId: string): string {
  // Deterministic code from userId prefix
  return 'QD' + userId.replace(/-/g, '').slice(0, 6).toUpperCase();
}

export const ReferralScreen: React.FC = () => {
  const { t } = useI18n();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReferral = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: referralRow } = await supabase
          .from('referrals')
          .select('code, successful_referrals, pending_referrals, coins_earned')
          .eq('user_id', user.id)
          .single();

        if (referralRow) {
          setData({
            code: referralRow.code,
            successfulReferrals: referralRow.successful_referrals ?? 0,
            pendingReferrals: referralRow.pending_referrals ?? 0,
            coinsEarned: referralRow.coins_earned ?? 0,
          });
        } else {
          // Auto-generate code for new users
          const code = generateCode(user.id);
          try { await supabase.from('referrals').insert({ user_id: user.id, code }); } catch { /* ignore */ }
          setData({ code, successfulReferrals: 0, pendingReferrals: 0, coinsEarned: 0 });
        }
      } else {
        setData({ code: 'QD000000', successfulReferrals: 0, pendingReferrals: 0, coinsEarned: 0 });
      }
    } catch {
      setData({ code: '------', successfulReferrals: 0, pendingReferrals: 0, coinsEarned: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReferral(); }, [loadReferral]);

  const handleShare = async () => {
    if (!data) return;
    try {
      await Share.share({
        message: `🧠 Try Quick Decision — the fast trivia battle game! Use my code ${data.code} when you sign up and we both get 50 bonus coins. Download: https://quickdecision.app`,
        title: 'Join Quick Decision!',
      });
    } catch {
      Alert.alert('Share failed', 'Could not open share sheet.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scroll}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🤝</Text>
          <Text style={styles.heroTitle}>{t('referral')}</Text>
          <Text style={styles.heroSubtitle}>{t('referralExplain')}</Text>
        </View>

        {/* Code card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>{t('yourReferralCode')}</Text>
          <Text style={styles.code}>{data?.code ?? '------'}</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>📤  {t('shareInvite')}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                {data?.successfulReferrals ?? 0}
              </Text>
              <Text style={styles.statLabel}>Successful</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.warning }]}>
                {data?.pendingReferrals ?? 0}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.yellow }]}>
                {(data?.coinsEarned ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Coins Earned</Text>
            </View>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.howCard}>
          <Text style={styles.cardTitle}>How It Works</Text>
          {[
            { step: '1', text: 'Share your unique referral code with friends' },
            { step: '2', text: 'Friend downloads and signs up with your code' },
            { step: '3', text: 'They play their first 3 games' },
            { step: '4', text: 'You both receive 50 bonus coins! 🎉' },
          ].map((item) => (
            <View key={item.step} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>{item.step}</Text>
              </View>
              <Text style={styles.stepText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  hero: { alignItems: 'center', marginBottom: 24 },
  heroEmoji: { fontSize: 56, marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 6 },
  heroSubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  codeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary + '60',
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  code: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 4,
    marginBottom: 20,
    fontVariant: ['tabular-nums'],
  },
  shareButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  shareButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  statValue: { fontSize: 26, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  howCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNum: { fontSize: 13, fontWeight: 'bold', color: '#fff' },
  stepText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
});
