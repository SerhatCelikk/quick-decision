import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
  return 'QD' + userId.replace(/-/g, '').slice(0, 6).toUpperCase();
}

// Step text keys resolved via t() in the component
const STEP_KEYS = ['referralStep1', 'referralStep2', 'referralStep3', 'referralStep4'] as const;
const STEP_ICONS = [
  { icon: 'share-social',    color: COLORS.primary },
  { icon: 'download',        color: COLORS.timerSafe },
  { icon: 'game-controller', color: COLORS.streak },
  { icon: 'gift',            color: COLORS.gold },
] as const;

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
        message: `${t('referralExplain')} ${t('yourReferralCode')}: ${data.code}`,
        title: 'Quick Decision',
      });
    } catch {
      Alert.alert(t('shareFailed'), t('shareFailedBody'));
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
        <LinearGradient colors={['#001020', '#001830']} style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="people" size={36} color={COLORS.accent} />
          </View>
          <Text style={styles.heroTitle}>{t('referral')}</Text>
          <Text style={styles.heroSubtitle}>{t('referralExplain')}</Text>
        </LinearGradient>

        {/* Code card */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>{t('yourReferralCode')}</Text>
          <Text style={styles.code}>{data?.code ?? '------'}</Text>
          <TouchableOpacity style={styles.shareWrap} onPress={handleShare} activeOpacity={0.88}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.shareButton}>
              <Ionicons name="share-social" size={18} color="#fff" />
              <Text style={styles.shareButtonText}>{t('shareInvite')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={[styles.statValue, { color: COLORS.success }]}>{data?.successfulReferrals ?? 0}</Text>
              <Text style={styles.statLabel}>{t('successful')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color={COLORS.timerWarning} />
              <Text style={[styles.statValue, { color: COLORS.timerWarning }]}>{data?.pendingReferrals ?? 0}</Text>
              <Text style={styles.statLabel}>{t('pendingLabel')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="gift" size={20} color={COLORS.gold} />
              <Text style={[styles.statValue, { color: COLORS.gold }]}>{(data?.coinsEarned ?? 0).toLocaleString()}</Text>
              <Text style={styles.statLabel}>{t('coinsEarned')}</Text>
            </View>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.howCard}>
          <Text style={styles.cardTitle}>{t('howItWorks')}</Text>
          {STEP_ICONS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: step.color + '22', borderColor: step.color + '55' }]}>
                <Ionicons name={step.icon as any} size={16} color={step.color} />
              </View>
              <Text style={styles.stepText}>{t(STEP_KEYS[i])}</Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 16, gap: 14 },

  hero: {
    alignItems: 'center', borderRadius: 22, padding: 28, gap: 8,
    borderWidth: 1, borderColor: COLORS.accent + '33',
  },
  heroIconWrap: {
    width: 66, height: 66, borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.accent + '55', backgroundColor: COLORS.accent + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  heroSubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19 },

  codeCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 24,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary + '55', gap: 12,
  },
  codeLabel: {
    fontSize: 10, fontWeight: '800', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  code: {
    fontSize: 36, fontWeight: '900', color: COLORS.primary,
    letterSpacing: 6, fontVariant: ['tabular-nums'],
  },
  shareWrap: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  shareButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 50,
  },
  shareButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  statsCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: 44, backgroundColor: COLORS.border },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  howCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: COLORS.border, gap: 14, marginBottom: 32,
  },
  cardTitle: {
    fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.2,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepBadge: {
    width: 36, height: 36, borderRadius: 11, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  stepText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
});
