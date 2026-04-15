import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';
import { getSocialStats, type SocialStats } from '../../services/socialService';
import { supabase } from '../../services/supabase';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ActionCard {
  icon: IoniconName;
  label: string;
  desc: string;
  screen: keyof RootStackParamList;
  accentColor: string;
  badge?: string;
}

// ─── Animated action card ─────────────────────────────────────────────────────
const Card: React.FC<{ card: ActionCard; index: number; onPress: () => void }> = ({
  card, index, onPress,
}) => {
  const slideAnim = useRef(new Animated.Value(44)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, delay: index * 80, useNativeDriver: true }),
      Animated.timing(opacAnim,  { toValue: 1, duration: 280, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const onIn  = () => Animated.timing(pressAnim,  { toValue: 0.96, duration: 75,  useNativeDriver: true }).start();
  const onOut = () => Animated.spring(pressAnim,  { toValue: 1,    tension: 280, friction: 13, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }, { scale: pressAnim }], opacity: opacAnim }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        style={styles.actionCard}
      >
        {/* Color accent bar left */}
        <View style={[styles.accentBar, { backgroundColor: card.accentColor }]} />

        <View style={styles.actionBody}>
          {/* Icon */}
          <View style={[styles.actionIcon, { backgroundColor: card.accentColor + '25', borderColor: card.accentColor + '50' }]}>
            <Ionicons name={card.icon} size={26} color={card.accentColor} />
          </View>

          {/* Text */}
          <View style={styles.actionText}>
            <Text style={styles.actionLabel}>{card.label}</Text>
            <Text style={styles.actionDesc}>{card.desc}</Text>
          </View>

          {/* Right side */}
          {card.badge && card.badge !== '0' && (
            <View style={[styles.badge, { backgroundColor: card.accentColor }]}>
              <Text style={styles.badgeText}>{card.badge}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.35)" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Pulsing live dot ─────────────────────────────────────────────────────────
const LiveDot: React.FC = () => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.7, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={{ width: 12, height: 12, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={{
        position: 'absolute', width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#4ADE80', opacity: 0.35, transform: [{ scale: pulse }],
      }} />
      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ADE80' }} />
    </View>
  );
};

export const SocialScreen: React.FC = () => {
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const headerAnim = useRef(new Animated.Value(0)).current;
  const [socialStats, setSocialStats] = useState<SocialStats>({
    friends: 0,
    pending: 0,
    wins: 0,
    battles: 0,
  });

  // Check if user is anonymous — redirect to AccountLink for social features
  const requireLinkedAccount = useCallback(async (action: () => void) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) {
      navigation.navigate('AccountLink');
      return;
    }
    action();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      getSocialStats().then(setSocialStats).catch(() => {});
    }, []),
  );

  const ACTIONS: ActionCard[] = [
    {
      icon: 'people',
      label: t('friends'),
      desc: t('socialFriendsDesc'),
      screen: 'Friends',
      accentColor: '#60A5FA',
      badge: socialStats.pending > 0 ? String(socialStats.pending) : undefined,
    },
    {
      icon: 'flash',
      label: t('challenges'),
      desc: t('socialChallengesDesc'),
      screen: 'Challenges',
      accentColor: '#FB923C',
    },
    {
      icon: 'share-social',
      label: t('socialShareCardLabel'),
      desc: t('socialShareCardDesc'),
      screen: 'ShareCard',
      accentColor: '#4ADE80',
    },
  ];

  const STATS = [
    { label: t('friends'),           value: String(socialStats.friends), icon: 'person' as IoniconName, color: '#60A5FA' },
    { label: t('wins'),              value: String(socialStats.wins),    icon: 'trophy' as IoniconName, color: '#FDE047' },
    { label: t('socialBattlesStat'), value: String(socialStats.battles), icon: 'flash'  as IoniconName, color: '#FB923C' },
  ];

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 380, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4F46E5', '#4338CA', '#3B35BC']} style={StyleSheet.absoluteFill} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View style={{ opacity: headerAnim }}>
          <Text style={styles.heading}>{t('social')}</Text>
          <Text style={styles.subheading}>{t('socialSubheading')}</Text>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsCard, { opacity: headerAnim }]}>
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <View style={[styles.statIconWrap, { backgroundColor: s.color + '22' }]}>
                  <Ionicons name={s.icon} size={18} color={s.color} />
                </View>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < STATS.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </Animated.View>

        {/* Action cards */}
        {ACTIONS.map((card, i) => (
          <Card
            key={card.screen}
            card={card}
            index={i}
            onPress={() => requireLinkedAccount(() => navigation.navigate(card.screen as any))}
          />
        ))}

        {/* Live Battle CTA */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => requireLinkedAccount(() => navigation.navigate('MultiplayerLobby' as any))}
          style={styles.battleWrap}
        >
          <LinearGradient
            colors={['#FEF08A', '#FDE047', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.9 }}
            style={styles.battleGrad}
          >
            <View style={styles.battleShine} pointerEvents="none" />
            <View style={styles.battleIconCircle}>
              <Ionicons name="game-controller" size={28} color="#1E1B4B" />
            </View>
            <View style={styles.battleText}>
              <Text style={styles.battleTitle}>{t('liveBattleTitle')}</Text>
              <Text style={styles.battleSub}>{t('liveBattleDesc')}</Text>
            </View>
            <View style={styles.battleRight}>
              <LiveDot />
              <Text style={styles.liveText}>{t('liveLabel')}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 108, gap: 12 },

  heading: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 30, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5,
  },
  subheading: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13, color: 'rgba(255,255,255,0.48)', marginTop: 3,
  },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 16, paddingHorizontal: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 5 },
  statIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  statValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, fontWeight: '900' },
  statLabel: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 10, color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 4 },

  actionCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22, shadowRadius: 8, elevation: 4,
  },
  accentBar: { width: 4 },
  actionBody: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 16, gap: 12,
  },
  actionIcon: {
    width: 52, height: 52, borderRadius: 16, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  actionText: { flex: 1 },
  actionLabel: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 16, fontWeight: '800', color: '#FFFFFF',
  },
  actionDesc: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12, color: 'rgba(255,255,255,0.52)', marginTop: 3, lineHeight: 16,
  },
  badge: {
    minWidth: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6,
  },
  badgeText: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 11, fontWeight: '800', color: '#1E1B4B' },

  battleWrap: {
    borderRadius: 22, overflow: 'hidden',
    shadowColor: '#FDE047',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.50, shadowRadius: 16, elevation: 10,
    marginTop: 4,
  },
  battleGrad: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 20,
    gap: 14, position: 'relative',
  },
  battleShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '48%',
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  battleIconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(30,27,75,0.18)',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
    borderWidth: 1, borderColor: 'rgba(30,27,75,0.2)',
  },
  battleText: { flex: 1 },
  battleTitle: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 18, fontWeight: '900', color: '#1E1B4B' },
  battleSub: { fontFamily: 'NunitoSans_400Regular', fontSize: 12, color: 'rgba(30,27,75,0.65)', marginTop: 3 },
  battleRight: { alignItems: 'center', gap: 5 },
  liveText: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 9, fontWeight: '800', color: '#1E1B4B', letterSpacing: 1.2,
  },
});
