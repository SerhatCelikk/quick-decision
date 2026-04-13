import React, { useRef, useEffect } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';
import type { RootStackParamList } from '../../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ActionCard {
  icon: IoniconName;
  label: string;
  desc: string;
  screen: keyof RootStackParamList;
  gradient: readonly [string, string];
  iconColor: string;
  badge?: string;
}

const AnimatedCard: React.FC<{ card: ActionCard; index: number; onPress: () => void }> = ({
  card, index, onPress,
}) => {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0, tension: 70, friction: 12, delay: index * 80, useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1, duration: 300, delay: index * 80, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.97, tension: 200, friction: 10, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ translateY: slideAnim }, { scale: scaleAnim }], opacity: opacityAnim }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.actionCard}>
          <LinearGradient
            colors={card.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionGradient}
          >
            {/* Icon area */}
            <View style={[styles.actionIconWrap, { borderColor: card.iconColor + '40' }]}>
              <Ionicons name={card.icon} size={32} color={card.iconColor} />
            </View>

            {/* Text */}
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionLabel}>{card.label}</Text>
              <Text style={styles.actionDesc}>{card.desc}</Text>
            </View>

            {/* Right side */}
            <View style={styles.actionRight}>
              {card.badge && (
                <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                  <Text style={styles.badgeText}>{card.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color={card.iconColor + 'AA'} />
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const SocialScreen: React.FC = () => {
  const { t } = useI18n();
  const navigation = useNavigation<Nav>();
  const headerAnim = useRef(new Animated.Value(0)).current;

  const ACTIONS: ActionCard[] = [
    {
      icon: 'people',
      label: t('friends'),
      desc: t('socialFriendsDesc'),
      screen: 'Friends',
      gradient: ['#003A5C', '#005C8A'],
      iconColor: '#29B6F6',
      badge: undefined,
    },
    {
      icon: 'flash',
      label: t('challenges'),
      desc: t('socialChallengesDesc'),
      screen: 'Challenges',
      gradient: ['#3A1A00', '#6A2E00'],
      iconColor: '#FF8C42',
      badge: '2',
    },
    {
      icon: 'share-social',
      label: t('socialShareCardLabel'),
      desc: t('socialShareCardDesc'),
      screen: 'ShareCard',
      gradient: ['#003D2E', '#006650'],
      iconColor: '#00C897',
      badge: undefined,
    },
  ];

  const STATS = [
    { label: t('friends'), value: '12', icon: 'person' as IoniconName, color: '#29B6F6' },
    { label: t('wins'), value: '48', icon: 'trophy' as IoniconName, color: '#FFD700' },
    { label: t('socialBattlesStat'), value: '63', icon: 'flash' as IoniconName, color: '#FF8C42' },
  ];

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View style={{ opacity: headerAnim }}>
          <Text style={styles.heading}>{t('social')}</Text>
          <Text style={styles.subheading}>{t('socialSubheading')}</Text>
        </Animated.View>

        {/* Stats strip */}
        <Animated.View style={[styles.statsRow, { opacity: headerAnim }]}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statPill}>
              <Ionicons name={s.icon} size={16} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Section header */}
        <Text style={styles.sectionTitle}>{t('actionsSection')}</Text>

        {/* Action cards */}
        {ACTIONS.map((card, i) => (
          <AnimatedCard
            key={card.screen}
            card={card}
            index={i}
            onPress={() => navigation.navigate(card.screen as any)}
          />
        ))}

        {/* Live Battle CTA */}
        <TouchableOpacity
          style={styles.battleWrap}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('MultiplayerLobby' as any)}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.battleGradient}
          >
            <View style={styles.battleIconCircle}>
              <Ionicons name="game-controller" size={28} color="#fff" />
            </View>
            <View style={styles.battleText}>
              <Text style={styles.battleTitle}>{t('liveBattleTitle')}</Text>
              <Text style={styles.battleSub}>{t('liveBattleDesc')}</Text>
            </View>
            <View style={styles.battleLive}>
              <View style={styles.liveDot} />
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
  scroll: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 40, gap: 10 },

  heading: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  subheading: { fontSize: 14, color: COLORS.textMuted, marginTop: 2, marginBottom: 4 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 0,
    marginBottom: 4,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingHorizontal: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginTop: 4,
    marginBottom: 2,
    marginLeft: 2,
  },

  actionCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  actionIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionTextWrap: { flex: 1 },
  actionLabel: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  actionDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3, lineHeight: 16 },
  actionRight: { alignItems: 'center', gap: 6 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },

  battleWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  battleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  battleIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  battleText: { flex: 1 },
  battleTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  battleSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  battleLive: { alignItems: 'center', gap: 4 },
  liveDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#fff',
    shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6,
  },
  liveText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
});
