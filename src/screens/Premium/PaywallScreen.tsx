import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

type Props = RootStackScreenProps<'Paywall'>;

type Plan = 'monthly' | 'yearly';

const PLANS = {
  monthly: { price: '$4.99', period: '/month', priceId: 'monthly_499' },
  yearly:  { price: '$35.99', period: '/year', priceId: 'yearly_3599' },
};

export const PaywallScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useI18n();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');
  const [purchasing, setPurchasing] = useState(false);

  const handleSubscribe = async () => {
    setPurchasing(true);
    try {
      // IAP via native StoreKit 2 / Play Billing would be triggered here.
      // In this integration build, show a message indicating native IAP is required.
      Alert.alert(
        'Premium Subscription',
        'In-app purchase requires a signed build with App Store / Play Store configuration. This feature is ready for TestFlight / internal testing.',
        [{ text: 'OK' }],
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = () => {
    Alert.alert('Restore Purchases', 'Checking for previous purchases…', [{ text: 'OK' }]);
  };

  const benefits = [
    { emoji: '🚫', text: t('premiumBenefit1') },
    { emoji: '⚡', text: t('premiumBenefit2') },
    { emoji: '👑', text: t('premiumBenefit3') },
    { emoji: '🔬', text: t('premiumBenefit4') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>👑</Text>
          <Text style={styles.heroTitle}>{t('premiumTitle')}</Text>
          <Text style={styles.heroSubtitle}>Unlock the full Quick Decision experience</Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          {benefits.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Text style={styles.benefitEmoji}>{b.emoji}</Text>
              <Text style={styles.benefitText}>{b.text}</Text>
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
            >
              {key === 'yearly' && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>BEST VALUE</Text>
                </View>
              )}
              <Text style={styles.planLabel}>{t(key === 'monthly' ? 'monthlyPlan' : 'yearlyPlan')}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planPeriod}>{plan.period}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaButton, purchasing && { opacity: 0.6 }]}
          onPress={handleSubscribe}
          disabled={purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>Subscribe — {PLANS[selectedPlan].price}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
          <Text style={styles.restoreText}>{t('restorePurchases')}</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Subscription auto-renews. Cancel anytime in App Store / Google Play settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 28 },
  heroEmoji: { fontSize: 60, marginBottom: 12 },
  heroTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 6 },
  heroSubtitle: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center' },
  benefitsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  benefitEmoji: { fontSize: 22, width: 36 },
  benefitText: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  plansRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  planCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: { borderColor: COLORS.primary },
  popularBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    alignItems: 'center',
  },
  popularText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  planLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600', marginTop: 20, textAlign: 'center' },
  planPrice: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
  planPeriod: { fontSize: 12, color: COLORS.textMuted },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  restoreButton: { alignItems: 'center', paddingVertical: 12 },
  restoreText: { fontSize: 14, color: COLORS.textMuted },
  legal: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
    opacity: 0.7,
  },
});
