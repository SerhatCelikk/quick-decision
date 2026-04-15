import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated, Dimensions, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { TabScreenProps } from '../../types/navigation';
import { COLORS, WORLD_THEMES, WORLDS, LEVELS_PER_WORLD } from '../../constants';
import { useI18n } from '../../i18n';
import { useLevelProgress } from '../../hooks/useLevelProgress';
import { useEnergy } from '../../hooks/useEnergy';
import { EnergyBar } from '../../components/EnergyBar';
import { DailyChallengeBanner } from '../../components/DailyChallengeBanner';
import { SeasonalEventBanner } from '../../components/SeasonalEventBanner';

type Props = TabScreenProps<'WorldMap'>;
const { width: W } = Dimensions.get('window');

// ─── World card ───────────────────────────────────────────────────────────────
interface WorldCardProps {
  name: string;
  icon: string;
  color: string;
  gradient: readonly [string, string, string];
  levelsCompleted: number;
  totalLevels: number;
  locked: boolean;
  isCurrent: boolean;
  animO: Animated.Value;
  animY: Animated.Value;
  onPress: () => void;
}

const WorldCard: React.FC<WorldCardProps> = ({
  name, icon, color, gradient,
  levelsCompleted, totalLevels, locked, isCurrent,
  animO, animY, onPress,
}) => {
  const pct      = totalLevels > 0 ? (levelsCompleted / totalLevels) * 100 : 0;
  const done     = !locked && levelsCompleted === totalLevels;
  const pressAnim = useRef(new Animated.Value(1)).current;

  const onIn  = () => Animated.timing(pressAnim, { toValue: 0.965, duration: 80,  useNativeDriver: true }).start();
  const onOut = () => Animated.spring(pressAnim, { toValue: 1,     tension: 280, friction: 13, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ opacity: animO, transform: [{ translateY: animY }, { scale: pressAnim }] }}>
      <TouchableOpacity
        onPress={!locked ? onPress : undefined}
        disabled={locked}
        activeOpacity={1}
        onPressIn={onIn}
        onPressOut={onOut}
        accessibilityRole="button"
        accessibilityLabel={`${name}${locked ? ', locked' : ''}`}
        style={[styles.card, locked && styles.cardLocked]}
      >
        <LinearGradient
          colors={locked ? (['#2D2A6E', '#252370', '#1E1C60'] as any) : gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGrad}
        >
          {/* Shine overlay */}
          <View style={styles.cardShine} pointerEvents="none" />

          <View style={styles.cardTop}>
            {/* Icon */}
            <View style={[styles.cardIcon, {
              backgroundColor: locked ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.22)',
            }]}>
              <Ionicons
                name={locked ? 'lock-closed' : icon as any}
                size={28}
                color={locked ? 'rgba(255,255,255,0.28)' : '#FFFFFF'}
              />
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <Text style={[styles.cardName, locked && { color: 'rgba(255,255,255,0.55)' }]}>
                {name}
              </Text>
              <Text style={[styles.cardSub, { color: locked ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.72)' }]}>
                {locked ? 'Complete previous world' : `${levelsCompleted} / ${totalLevels} levels`}
              </Text>
            </View>

            {/* Status badges */}
            {isCurrent && !locked && (
              <View style={styles.badgeNow}>
                <Text style={styles.badgeNowText}>NOW</Text>
              </View>
            )}
            {done && (
              <View style={styles.badgeDone}>
                <Ionicons name="checkmark" size={11} color="#4ADE80" />
              </View>
            )}
            {!locked && (
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.60)" />
            )}
          </View>

          {/* Progress bar */}
          {!locked && (
            <View style={styles.progRow}>
              <View style={styles.progTrack}>
                <View style={[styles.progFill, {
                  width: `${Math.round(pct)}%` as `${number}%`,
                }]} />
              </View>
              <Text style={styles.progPct}>{Math.round(pct)}%</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export const WorldMapScreen: React.FC<Props> = ({ navigation }) => {
  const { t, language } = useI18n();
  const { progress, refresh } = useLevelProgress();
  const { hearts, maxHearts, secondsUntilRegen, refillHearts } = useEnergy();

  // Re-fetch progress whenever the screen comes into focus (e.g., after a level is completed)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const currentLevel         = progress.current_level;
  const highestLevelUnlocked = progress.highest_level_unlocked;
  const xpPct               = ((currentLevel - 1) % 10) / 10;
  const streak               = 3;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnims  = useRef(WORLDS.map(() => ({
    opacity: new Animated.Value(0),
    y:       new Animated.Value(30),
  }))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 340, useNativeDriver: true }),
      Animated.stagger(95, cardAnims.map(a =>
        Animated.parallel([
          Animated.timing(a.opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
          Animated.spring(a.y, { toValue: 0, tension: 68, friction: 10, useNativeDriver: true }),
        ])
      )),
    ]).start();
  }, []);

  function getWorldProgress(worldId: number) {
    const worldEntry = WORLDS.find(w => w.worldId === worldId);
    const unlockThreshold = worldEntry?.unlockAfterLevel ?? 0;
    const start     = (worldId - 1) * LEVELS_PER_WORLD + 1;
    // World is locked if the player hasn't reached the unlock threshold yet
    const locked    = worldId > 1 && highestLevelUnlocked < unlockThreshold + 1;
    const completed = locked ? 0 : Math.max(0, Math.min(highestLevelUnlocked - start, LEVELS_PER_WORLD));
    const isCurrent = !locked && completed < LEVELS_PER_WORLD;
    return { completed, locked, isCurrent };
  }

  const handleWorldPress = useCallback((worldId: number, name: string, color: string) => {
    navigation.navigate('LevelMap', { worldId, worldName: name, worldColor: color });
  }, [navigation]);

  const getWorldName = useCallback((theme: typeof WORLD_THEMES[keyof typeof WORLD_THEMES]) => {
    return language === 'tr' ? theme.nameTR : theme.name;
  }, [language]);

  return (
    <SafeAreaView testID="world-map-screen" style={styles.container} edges={['top']}>
      {/* Vivid indigo gradient background */}
      <LinearGradient
        colors={['#4F46E5', '#4338CA', '#3B35BC']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Decorative blobs */}
      <View style={styles.blob1} pointerEvents="none" />
      <View style={styles.blob2} pointerEvents="none" />

      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <View>
          <Text style={styles.appName}>Quick Decision</Text>
          <Text style={styles.appTagline}>{t('appTagline')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          accessibilityRole="button"
          accessibilityLabel={t('profile')}
          activeOpacity={0.85}
          style={styles.profileBtnWrap}
        >
          <LinearGradient colors={['#FEF08A', '#FDE047']} style={styles.profileBtn}>
            <Ionicons name="person" size={18} color="#1E1B4B" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Stats strip ── */}
      <Animated.View style={[styles.statsStrip, { opacity: headerAnim }]}>
        <View style={styles.stripChip}>
          <Ionicons name="flash" size={13} color={COLORS.primary} />
          <Text style={styles.stripChipText}>Lv {currentLevel}</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.stripChip}>
          <Ionicons name="flame" size={13} color={COLORS.streak} />
          <Text style={styles.stripChipText}>{streak}</Text>
        </View>
        <View style={styles.stripDivider} />
        <EnergyBar
          hearts={hearts}
          maxHearts={maxHearts}
          size={15}
          secondsUntilRegen={hearts < maxHearts ? secondsUntilRegen : undefined}
          onWatchAd={hearts <= 0 ? refillHearts : undefined}
        />
        <View style={styles.xpWrap}>
          <View style={[styles.xpFill, { width: `${Math.round(xpPct * 100)}%` as `${number}%` }]} />
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('chooseYourWorld')}</Text>
          <Text style={styles.sectionSub}>{t('tapWorldToStart')}</Text>
        </View>

        {/* World cards */}
        {WORLDS.map((world, i) => {
          const theme = WORLD_THEMES[world.key];
          const worldName = getWorldName(theme);
          const { completed, locked, isCurrent } = getWorldProgress(world.worldId);
          return (
            <WorldCard
              key={world.worldId}
              name={worldName}
              icon={theme.icon}
              color={theme.color}
              gradient={theme.gradient}
              levelsCompleted={completed}
              totalLevels={LEVELS_PER_WORLD}
              locked={locked}
              isCurrent={isCurrent}
              animO={cardAnims[i].opacity}
              animY={cardAnims[i].y}
              onPress={() => handleWorldPress(world.worldId, worldName, theme.color)}
            />
          );
        })}

        {/* Coming soon */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>{t('moreWorldsComing')}</Text>
          <Ionicons name="lock-closed" size={13} color="rgba(255,255,255,0.28)" />
        </View>

        {/* Banners */}
        <View style={styles.bannersWrap}>
          <Text style={styles.sectionTitle}>{t('todayLabel')}</Text>
          <SeasonalEventBanner
            onPress={() => navigation.navigate('SeasonalEvent', {
              eventId: 'spring_2026',
              eventTitle: t('springKnowledgeSprint'),
            })}
          />
          <DailyChallengeBanner />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  blob1: {
    position: 'absolute', top: -90, right: -55,
    width: 230, height: 230, borderRadius: 115,
    backgroundColor: 'rgba(244,113,181,0.16)',
  },
  blob2: {
    position: 'absolute', bottom: 220, left: -70,
    width: 190, height: 190, borderRadius: 95,
    backgroundColor: 'rgba(253,224,71,0.07)',
  },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
  },
  appName: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3,
  },
  appTagline: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 11, color: 'rgba(255,255,255,0.48)', marginTop: 1,
  },
  profileBtnWrap: {
    shadowColor: '#FDE047',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 8,
  },
  profileBtn: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },

  statsStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
  },
  stripChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stripChipText: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 13, fontWeight: '800', color: '#FFFFFF',
  },
  stripDivider: { width: 1, height: 14, backgroundColor: 'rgba(255,255,255,0.18)' },
  xpWrap: {
    flex: 1, height: 5,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 3, overflow: 'hidden',
  },
  xpFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },

  scroll: { paddingHorizontal: 20, paddingBottom: 108, gap: 14 },

  sectionHeader: { gap: 2 },
  sectionTitle: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.2,
  },
  sectionSub: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12, color: 'rgba(255,255,255,0.48)',
  },

  card: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  cardLocked: { opacity: 0.70 },
  cardGrad: { paddingHorizontal: 18, paddingVertical: 18, gap: 14, position: 'relative' },
  cardShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  cardInfo: { flex: 1 },
  cardName: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 20, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.2,
  },
  cardSub: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 12, marginTop: 2,
  },
  badgeNow: {
    paddingHorizontal: 9, paddingVertical: 4,
    backgroundColor: 'rgba(253,224,71,0.22)',
    borderWidth: 1, borderColor: 'rgba(253,224,71,0.48)',
    borderRadius: 10,
  },
  badgeNowText: {
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 9, fontWeight: '800', color: '#FDE047', letterSpacing: 0.8,
  },
  badgeDone: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(74,222,128,0.22)',
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.48)',
    justifyContent: 'center', alignItems: 'center',
  },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progTrack: {
    flex: 1, height: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 3, overflow: 'hidden',
  },
  progFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 3 },
  progPct: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.72)',
    minWidth: 30, textAlign: 'right',
  },

  comingSoon: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.10)',
    borderStyle: 'dashed', borderRadius: 16,
  },
  comingSoonText: {
    fontFamily: 'NunitoSans_600SemiBold',
    fontSize: 13, color: 'rgba(255,255,255,0.35)',
  },

  bannersWrap: { gap: 10 },
});
