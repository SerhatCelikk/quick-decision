import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { TabScreenProps } from '../../types/navigation';
import { COLORS, WORLD_THEMES, WORLDS, LEVELS_PER_WORLD } from '../../constants';
import { useLevelProgress } from '../../hooks/useLevelProgress';
import { useEnergy } from '../../hooks/useEnergy';
import { EnergyBar } from '../../components/EnergyBar';
import { DailyChallengeBanner } from '../../components/DailyChallengeBanner';
import { SeasonalEventBanner } from '../../components/SeasonalEventBanner';

type Props = TabScreenProps<'WorldMap'>;
const { width: W } = Dimensions.get('window');

// ─── XP progress bar ──────────────────────────────────────────────────────────
const XPBar: React.FC<{ level: number; xp: number; maxXP: number }> = ({ level, xp, maxXP }) => {
  const pct = Math.min(xp / maxXP, 1);
  const fillAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fillAnim, { toValue: pct, duration: 900, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={xpStyles.wrap}>
      <View style={xpStyles.levelBadge}>
        <Ionicons name="flash" size={11} color="#fff" />
        <Text style={xpStyles.levelNum}>Lv {level}</Text>
      </View>
      <View style={xpStyles.track}>
        <Animated.View
          style={[
            xpStyles.fill,
            { width: fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>
      <Text style={xpStyles.xpLabel}>{xp}/{maxXP}</Text>
    </View>
  );
};
const xpStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  levelNum: { fontSize: 11, fontWeight: '800', color: '#fff' },
  track: {
    flex: 1, height: 8, backgroundColor: COLORS.surface2, borderRadius: 4, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  fill: { position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 4, backgroundColor: COLORS.primary },
  xpLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', minWidth: 52, textAlign: 'right' },
});

// ─── Streak chip ──────────────────────────────────────────────────────────────
const StreakChip: React.FC<{ streak: number }> = ({ streak }) => {
  const flameAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (streak === 0) return;
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, { toValue: 1.2, duration: 700, useNativeDriver: true }),
        Animated.timing(flameAnim, { toValue: 0.9, duration: 700, useNativeDriver: true }),
      ])
    );
    a.start();
    return () => a.stop();
  }, [streak]);
  return (
    <View style={chipStyles.wrap}>
      <Animated.View style={{ transform: [{ scale: flameAnim }] }}>
        <Ionicons name="flame" size={16} color={streak > 0 ? '#FF6B35' : COLORS.border} />
      </Animated.View>
      <Text style={[chipStyles.num, { color: streak > 0 ? '#FF6B35' : COLORS.textMuted }]}>{streak}</Text>
    </View>
  );
};
const chipStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  num: { fontSize: 15, fontWeight: '900' },
});

// ─── World card (compact, fills width) ────────────────────────────────────────
interface WorldCardProps {
  name: string;
  emoji: string;
  icon: string;
  color: string;
  dimColor: string;
  gradient: readonly [string, string];
  levelsCompleted: number;
  totalLevels: number;
  locked: boolean;
  isNext: boolean;
  onPress: () => void;
  animOpacity: Animated.Value;
  animTranslate: Animated.Value;
}

const WorldCard: React.FC<WorldCardProps> = ({
  name, emoji, icon, color, dimColor, gradient,
  levelsCompleted, totalLevels, locked, isNext, onPress,
  animOpacity, animTranslate,
}) => {
  const pct = totalLevels > 0 ? (levelsCompleted / totalLevels) * 100 : 0;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.timing(pressAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(pressAnim, { toValue: 1, tension: 250, friction: 15, useNativeDriver: true }).start();

  return (
    <Animated.View style={{
      transform: [{ scale: pressAnim }, { translateY: animTranslate }],
      opacity: animOpacity,
    }}>
      <TouchableOpacity
        onPress={!locked ? onPress : undefined}
        disabled={locked}
        activeOpacity={1}
        onPressIn={onIn}
        onPressOut={onOut}
        style={[styles.worldCard, locked && styles.worldCardLocked]}
        accessibilityRole="button"
        accessibilityLabel={`${name} world${locked ? ', locked' : ''}`}
      >
        <LinearGradient
          colors={locked ? [COLORS.surface, COLORS.surface2] : gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.worldGrad}
        >
          {/* Background glow orb */}
          {!locked && <View style={[styles.cardOrb, { backgroundColor: color }]} />}

          {/* Emoji icon */}
          <View style={[styles.worldEmoji, { backgroundColor: locked ? COLORS.border + '40' : color + '25', borderColor: locked ? COLORS.border : color + '55' }]}>
            {locked
              ? <Ionicons name="lock-closed" size={22} color={COLORS.textMuted} />
              : <Text style={{ fontSize: 28 }}>{emoji}</Text>
            }
          </View>

          {/* Info */}
          <View style={styles.worldBody}>
            <View style={styles.worldNameRow}>
              <Text style={[styles.worldName, { color: locked ? COLORS.textMuted : '#FFFFFF' }]}>{name}</Text>
              {isNext && !locked && (
                <View style={[styles.nextBadge, { backgroundColor: color }]}>
                  <Text style={styles.nextBadgeText}>NEXT</Text>
                </View>
              )}
              {levelsCompleted === totalLevels && !locked && (
                <View style={[styles.nextBadge, { backgroundColor: COLORS.success }]}>
                  <Ionicons name="checkmark" size={9} color="#fff" />
                  <Text style={styles.nextBadgeText}>DONE</Text>
                </View>
              )}
            </View>
            {locked ? (
              <Text style={styles.worldLockHint}>Complete previous world to unlock</Text>
            ) : (
              <>
                <Text style={[styles.worldProg, { color: color + 'CC' }]}>
                  {levelsCompleted} / {totalLevels} levels
                </Text>
                <View style={styles.worldTrack}>
                  <LinearGradient
                    colors={[color + '99', color]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.worldFill, { width: `${Math.round(pct)}%` as `${number}%` }]}
                  />
                </View>
              </>
            )}
          </View>

          {/* Arrow */}
          {!locked && (
            <View style={[styles.arrowCircle, { backgroundColor: color + '22', borderColor: color + '44' }]}>
              <Ionicons name="chevron-forward" size={18} color={color} />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export const WorldMapScreen: React.FC<Props> = ({ navigation }) => {
  const { progress } = useLevelProgress();
  const { hearts, maxHearts, secondsUntilRegen, refillHearts } = useEnergy();

  const currentLevel = progress?.current_level ?? 1;
  const playerXP = ((currentLevel - 1) % 10) * 100;
  const streak = 3; // replace with real data

  const cardAnims = useRef(WORLDS.map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(30),
  }))).current;

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.stagger(80, cardAnims.map(a =>
        Animated.parallel([
          Animated.timing(a.opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
          Animated.spring(a.translateY, { toValue: 0, tension: 90, friction: 12, useNativeDriver: true }),
        ])
      )),
    ]).start();
  }, []);

  function getWorldProgress(worldId: number) {
    const start = (worldId - 1) * LEVELS_PER_WORLD + 1;
    const completed = Math.max(0, Math.min(currentLevel - start, LEVELS_PER_WORLD));
    const locked = currentLevel < start && worldId > 1;
    const isNext = !locked && completed === 0 && worldId > 1;
    return { completed, locked, isNext };
  }

  const handleWorldPress = useCallback((worldId: number, name: string, color: string) => {
    navigation.navigate('LevelMap', { worldId, worldName: name, worldColor: color });
  }, [navigation]);

  return (
    <SafeAreaView testID="world-map-screen" style={styles.container} edges={['top']}>

      {/* ── Compact header ── */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <LinearGradient
          colors={[COLORS.primaryGlow, 'transparent']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Row 1: title + profile */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appName}>Quick Decision</Text>
            <Text style={styles.appTagline}>How weird is the world?</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.profileGrad}>
              <Ionicons name="person" size={19} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Row 2: streak + energy + xp */}
        <View style={styles.statsStrip}>
          <StreakChip streak={streak} />
          <View style={styles.stripDivider} />
          <EnergyBar
            hearts={hearts}
            maxHearts={maxHearts}
            size={18}
            secondsUntilRegen={hearts < maxHearts ? secondsUntilRegen : undefined}
            onWatchAd={hearts <= 0 ? refillHearts : undefined}
          />
          <View style={styles.stripDivider} />
          <View style={{ flex: 1 }}>
            <XPBar level={currentLevel} xp={playerXP} maxXP={1000} />
          </View>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Worlds section — shown first, no scroll needed ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Choose Your World</Text>
          <Text style={styles.sectionSub}>Tap a world to start playing</Text>
        </View>

        {WORLDS.map((world, i) => {
          const theme = WORLD_THEMES[world.key];
          const { completed, locked, isNext } = getWorldProgress(world.worldId);
          return (
            <WorldCard
              key={world.worldId}
              name={theme.name}
              emoji={theme.emoji}
              icon={theme.icon}
              color={theme.color}
              dimColor={theme.dimColor}
              gradient={theme.gradient}
              levelsCompleted={completed}
              totalLevels={LEVELS_PER_WORLD}
              locked={locked}
              isNext={isNext}
              animOpacity={cardAnims[i].opacity}
              animTranslate={cardAnims[i].translateY}
              onPress={() => handleWorldPress(world.worldId, theme.name, theme.color)}
            />
          );
        })}

        {/* Coming soon */}
        <TouchableOpacity style={styles.comingSoon} activeOpacity={0.7}>
          <View style={styles.csDots}>
            {[0, 1, 2].map(i => <View key={i} style={[styles.csDot, { opacity: 0.3 + i * 0.25 }]} />)}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.csTitle}>More worlds coming</Text>
            <Text style={styles.csSub}>Memes · Guinness · Pop Culture</Text>
          </View>
          <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* ── Banners below worlds ── */}
        <View style={styles.bannerSection}>
          <Text style={styles.bannerSectionTitle}>TODAY</Text>
          <SeasonalEventBanner onPress={() =>
            navigation.navigate('SeasonalEvent', { eventId: 'spring_2026', eventTitle: 'Spring Knowledge Sprint' })
          } />
          <DailyChallengeBanner />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    overflow: 'hidden',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appName: { fontSize: 22, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  appTagline: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  profileGrad: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stripDivider: { width: 1, height: 20, backgroundColor: COLORS.border },

  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 10 },

  sectionHeader: { gap: 2, marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, letterSpacing: -0.3 },
  sectionSub: { fontSize: 12, color: COLORS.textMuted },

  // World card
  worldCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  worldCardLocked: { opacity: 0.55 },
  worldGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    minHeight: 88,
    overflow: 'hidden',
  },
  cardOrb: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    right: -15,
    top: -30,
    opacity: 0.18,
  },
  worldEmoji: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  worldBody: { flex: 1, gap: 4 },
  worldNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  worldName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.2 },
  nextBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 3 },
  nextBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  worldProg: { fontSize: 11, fontWeight: '600' },
  worldLockHint: { fontSize: 11, color: COLORS.textMuted },
  worldTrack: { height: 5, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden' },
  worldFill: { height: '100%', borderRadius: 3 },
  arrowCircle: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },

  // Coming soon
  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  csDots: { flexDirection: 'column', gap: 3 },
  csDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  csTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  csSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },

  // Banners section
  bannerSection: { gap: 8, marginTop: 8 },
  bannerSectionTitle: {
    fontSize: 10, fontWeight: '800', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 2,
  },
});
