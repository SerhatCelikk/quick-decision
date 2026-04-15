import React, { useRef, useEffect, useState } from 'react';
import {
  Animated, Linking, StyleSheet, Text, TouchableOpacity, View, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';
import { supabase } from '../../services/supabase';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const AccountLinkScreen: React.FC = () => {
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(false);

  const cardAnim  = useRef(new Animated.Value(0.88)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardAnim, { toValue: 1, tension: 68, friction: 11, useNativeDriver: true }),
      Animated.timing(opacAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 68, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const redirectTo = 'quickdecision://auth/callback';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      await Linking.openURL(data.url);
    } catch (err: any) {
      Alert.alert(
        t('error'),
        err?.message ?? 'Google sign-in failed. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setLoading(false);
    }
  };

  const PERKS = [
    { icon: 'trophy' as const,      text: t('accountLinkPerk1') },
    { icon: 'people' as const,      text: t('accountLinkPerk2') },
    { icon: 'shield-checkmark' as const, text: t('accountLinkPerk3') },
    { icon: 'cloud-upload' as const, text: t('accountLinkPerk4') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#4F46E5', '#4338CA', '#3B35BC']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Decorative blob */}
      <View style={styles.blob} pointerEvents="none" />

      {/* Back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-back" size={22} color="rgba(255,255,255,0.85)" />
      </TouchableOpacity>

      <Animated.View style={[styles.content, { opacity: opacAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Hero icon */}
        <Animated.View style={[styles.heroWrap, { transform: [{ scale: cardAnim }] }]}>
          <LinearGradient colors={['#FEF08A', '#FDE047']} style={styles.heroGrad}>
            <Ionicons name="person-circle" size={44} color="#1E1B4B" />
          </LinearGradient>
        </Animated.View>

        <Text style={styles.title}>{t('accountLinkTitle')}</Text>
        <Text style={styles.subtitle}>{t('accountLinkSubtitle')}</Text>

        {/* Perks list */}
        <View style={styles.perksCard}>
          {PERKS.map((perk, i) => (
            <View key={i} style={styles.perkRow}>
              <View style={styles.perkIconWrap}>
                <Ionicons name={perk.icon} size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.perkText}>{perk.text}</Text>
            </View>
          ))}
        </View>

        {/* Google sign-in button */}
        <TouchableOpacity
          style={[styles.googleBtn, loading && { opacity: 0.75 }]}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('accountLinkGoogle')}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F1F5F9']}
            style={styles.googleBtnGrad}
          >
            <View style={styles.googleLogo}>
              {/* Google G logo rendered with colored bars */}
              <Text style={styles.googleG}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>
              {loading ? t('loading') : t('accountLinkGoogle')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>{t('accountLinkDisclaimer')}</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  blob: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(139,92,246,0.18)',
    top: -80,
    right: -80,
  },
  backBtn: {
    marginTop: 8,
    marginLeft: 16,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  heroWrap: {
    marginBottom: 24,
  },
  heroGrad: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FDE047',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.68)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  perksCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 20,
    marginBottom: 28,
    gap: 14,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  perkIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(253,224,71,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    flex: 1,
  },
  googleBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    marginBottom: 16,
  },
  googleBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  googleLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  googleBtnText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#1E1B4B',
  },
  disclaimer: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },
});
