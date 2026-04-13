import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../../types';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

type Props = RootStackScreenProps<'Paywall'>;
type Plan = 'monthly' | 'yearly';

const PLANS = {
  monthly: { price: '$4.99', period: '/month', priceId: 'monthly_499' },
  yearly:  { price: '$35.99', period: '/year', priceId: 'yearly_3599' },
};

const BENEFITS: { icon: string; color: string; text: string; key: string }[] = [
  { icon: 'ban',           color: COLORS.danger,   text: 'premiumBenefit1', key: 'ads' },
  { icon: 'flash',         color: COLORS.gold,     text: 'premiumBenefit2', key: 'energy' },
  { icon: 'diamond',       color: COLORS.accent,   text: 'premiumBenefit3', key: 'content' },
  { icon: 'flask',         color: COLORS.timerSafe, text: 'premiumBenefit4', key: 'stats' },
];

export const PaywallScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [purchasing, setPurchasing] = useState(false);

  const handleSubscribe = async () => {
    setPurchasing(true);
    try {
      Alert.alert(
        t('premiumSubscriptionTitle'),
        t('premiumIapNote'),
        [{ text: t('ok') }],
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = () => {
    Alert.alert(t('restorePurchases'), t('restorePurchasesChecking'), [{ text: t('ok') }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <LinearGradient colors={['#2A1A00', '#3D2800']} style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="diamond" size={40} color={COLORS.gold} />
          </View>
          <Text style={styles.heroTitle}>{t('premiumTitle')}</Text>
          <Text style={styles.heroSubtitle}>{t('unlockFullExperience')}</Text>
        </LinearGradient>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          {BENEFITS.map((b) => (
            <View key={b.key} style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: b.color + '22', borderColor: b.color + '44' }]}>
                <Ionicons name={b.icon as any} size={18} color={b.color} />
              </View>
              <Text style={styles.benefitText}>{t(b.text as any)}</Text>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            </View>
          ))}
        </View>

        {/* Plan selector */}
        <View style={styles.plansRow}>
          {(Object.entries(PLANS) as [Plan, typeof PLANS.monthly][]).map(([key, plan]) => (
            <TouchableOpacity
              key={key}
              style={[styles.planCard, selectedPlan === key && styles.planCardSelected]}
              onPress={() => setSelectedPlan(key)}
              activeOpacity={0.85}
            >
              {key === 'yearly' && (
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.popularBadge}>
                  <Text style={styles.popularText}>{t('bestValue')}</Text>
                </LinearGradient>
              )}
              <Text style={[styles.planLabel, key === 'yearly' && { marginTop: 28 }]}>
                {t(key === 'monthly' ? 'monthlyPlan' : 'yearlyPlan')}
              </Text>
              <Text style={[styles.planPrice, selectedPlan === key && { color: COLORS.gold }]}>{plan.price}</Text>
              <Text style={styles.planPeriod}>{plan.period}</Text>
              {selectedPlan === key && (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.gold} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaWrap, purchasing && { opacity: 0.6 }]}
          onPress={handleSubscribe}
          disabled={purchasing}
          activeOpacity={0.88}
        >
          <LinearGradient colors={['#CC9F00', COLORS.gold]} style={styles.ctaBtn}>
            {purchasing ? (
              <ActivityIndicator color="#1A1200" />
            ) : (
              <>
                <Ionicons name="diamond" size={20} color="#1A1200" />
                <Text style={styles.ctaText}>{t('subscribeBtnFmt').replace('{price}', PLANS[selectedPlan].price)}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
          <Text style={styles.restoreText}>{t('restorePurchases')}</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>{t('subscriptionLegal')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 0, paddingBottom: 40, gap: 16 },

  hero: {
    alignItems: 'center', borderRadius: 24, padding: 32,
    borderWidth: 1, borderColor: COLORS.gold + '44', gap: 10,
  },
  heroIconWrap: {
    width: 72, height: 72, borderRadius: 22, borderWidth: 1,
    borderColor: COLORS.gold + '55', backgroundColor: COLORS.gold + '20',
    justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 26, fontWeight: '900', color: COLORS.gold, letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },

  benefitsCard: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: COLORS.border, gap: 14,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitIcon: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  benefitText: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '600' },

  plansRow: { flexDirection: 'row', gap: 12 },
  planCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 18, padding: 16,
    alignItems: 'center', borderWidth: 2, borderColor: COLORS.border,
    position: 'relative', overflow: 'hidden', gap: 4,
  },
  planCardSelected: { borderColor: COLORS.gold },
  popularBadge: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingVertical: 5, alignItems: 'center',
  },
  popularText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  checkCircle: { position: 'absolute', top: 10, right: 10 },
  planLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  planPrice: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginTop: 4 },
  planPeriod: { fontSize: 12, color: COLORS.textMuted },

  ctaWrap: {
    borderRadius: 18, overflow: 'hidden',
    shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  ctaBtn: {
    height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  ctaText: { fontSize: 17, fontWeight: '800', color: '#1A1200' },

  restoreButton: { alignItems: 'center', paddingVertical: 8 },
  restoreText: { fontSize: 14, color: COLORS.textMuted },
  legal: {
    fontSize: 11, color: COLORS.textMuted, textAlign: 'center',
    lineHeight: 16, opacity: 0.7,
  },
});
