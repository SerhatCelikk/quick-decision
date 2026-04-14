import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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

const STEP_KEYS = ['referralStep1', 'referralStep2', 'referralStep3', 'referralStep4'] as const;
const STEP_ICONS = [
  { icon: 'share-social',    color: COLORS.primary },
  { icon: 'download',        color: COLORS.timerSafe },
  { icon: 'game-controller', color: COLORS.streak },
  { icon: 'gift',            color: COLORS.gold },
] as const;

export const ReferralScreen: React.FC = () => {
  const { t } = useI18n();
  const navigation = useNavigation();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4F46E5', '#4338CA', '#3B35BC']} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('goBack')}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t('referral')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <LinearGradient colors={['rgba(244,113,181,0.20)', 'rgba(244,113,181,0.06)']} style={styles.hero}>
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
              <LinearGradient colors={['#FEF08A', '#FDE047']} style={styles.shareButton}>
                <Ionicons name="share-social" size={18} color="#1E1B4B" />
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
              <View key={i} style={[styles.stepRow, i < STEP_ICONS.length - 1 && styles.stepRowBorder]}>
                <View style={[styles.stepBadge, { backgroundColor: step.color + '22', borderColor: step.color + '55' }]}>
                  <Ionicons name={step.icon as any} size={16} color={step.color} />
                </View>
                <Text style={styles.stepText}>{t(STEP_KEYS[i])}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
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

  scroll: { paddingHorizontal: 20, paddingTop: 0, paddingBottom: 40, gap: 14 },

  hero: {
    alignItems: 'center', borderRadius: 22, padding: 28, gap: 8,
    borderWidth: 1, borderColor: 'rgba(244,113,181,0.30)',
  },
  heroIconWrap: {
    width: 66, height: 66, borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.accent + '55', backgroundColor: COLORS.accent + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22, fontWeight: '900', color: COLORS.text,
  },
  heroSubtitle: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19, paddingHorizontal: 8,
  },

  codeCard: {
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 20, padding: 24,
    alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(253,224,71,0.40)', gap: 12,
  },
  codeLabel: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 10, fontWeight: '800', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  code: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 36, fontWeight: '900', color: '#FDE047',
    letterSpacing: 6,
  },
  shareWrap: {
    width: '100%', borderRadius: 14, overflow: 'hidden',
    shadowColor: '#FDE047', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  shareButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 52,
  },
  shareButtonText: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 16, fontWeight: '800', color: '#1E1B4B',
  },

  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
  },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.14)' },
  statValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24, fontWeight: '900',
  },
  statLabel: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5,
  },

  howCard: {
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', gap: 0,
  },
  cardTitle: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 12,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  stepRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.10)' },
  stepBadge: {
    width: 36, height: 36, borderRadius: 11, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  stepText: {
    fontFamily: 'NunitoSans_600SemiBold',
    flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20, fontWeight: '600',
  },
});
