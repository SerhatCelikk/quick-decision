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
import type { RootStackScreenProps } from '../../types/navigation';
import { COLORS, LEVELS_PER_WORLD, WORLD_THEMES, WORLDS } from '../../constants';
import { useLevelProgress } from '../../hooks/useLevelProgress';
import { LevelNode, type LevelNodeState } from '../../components/LevelNode';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useI18n, type TranslationKey } from '../../i18n';
import { getCategoryId } from '../../services/gameService';

type Props = RootStackScreenProps<'LevelMap'>;
const { width: W } = Dimensions.get('window');
const CENTER = W / 2;

// Snake path: 6-point zigzag cycle
const X_OFFSETS = [-90, -40, 20, 80, 20, -40];

// Per-slot height estimate for auto-scroll (node 72 + connector 44 + padding)
const SLOT_HEIGHT = 128;
const MILESTONE_HEIGHT = 44;

function getLevelState(wln: number, cur: number, high: number): LevelNodeState {
  if (wln < cur) return 'completed';
  if (wln === cur) return 'current';
  if (wln <= high) return 'unlocked';
  return 'locked';
}
function getMockStars(wln: number, cur: number): 0 | 1 | 2 | 3 {
  if (wln >= cur) return 0;
  return ([3, 1, 2, 3, 2, 1][wln % 6]) as 0 | 1 | 2 | 3;
}
function getWorldTheme(worldId: number) {
  const w = WORLDS.find(w => w.worldId === worldId);
  return w ? WORLD_THEMES[w.key] : WORLD_THEMES.jungle;
}

// ─── Path dots between two node centres ──────────────────────────────────────
const PathConnector: React.FC<{
  fromX: number;
  toX: number;
  completed: boolean;
  color: string;
}> = ({ fromX, toX, completed, color }) => {
  const count = 6;
  return (
    <View style={{ height: 44, width: '100%', position: 'relative' }}>
      {Array.from({ length: count }, (_, i) => {
        const t = (i + 0.5) / count;
        const x = CENTER + fromX + (toX - fromX) * t;
        return (
          <View
            key={i}
            style={[
              dot.d,
              { left: x - 4, backgroundColor: completed ? color : COLORS.border },
            ]}
          />
        );
      })}
    </View>
  );
};
const dot = StyleSheet.create({ d: { position: 'absolute', width: 8, height: 8, borderRadius: 4, top: 18 } });

// ─── Background twinkle star ──────────────────────────────────────────────────
const BgStar: React.FC<{ x: number; y: number; size: number; color: string; delay: number }> = ({
  x, y, size, color, delay,
}) => {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(op, { toValue: 0.4, duration: 2200, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.06, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, [delay]);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: x, top: y, opacity: op }}>
      <Ionicons name="star" size={size} color={color} />
    </Animated.View>
  );
};

// ─── Floating gem decoration ──────────────────────────────────────────────────
const FloatingGem: React.FC<{ x: number; y: number; color: string; delay: number }> = ({
  x, y, color, delay,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(floatAnim, { toValue: -8, duration: 1800, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
        ])
      ),
      Animated.timing(opAnim, { toValue: 0.6, duration: 800, delay, useNativeDriver: true }),
    ]).start();
  }, [delay]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: x, top: y, opacity: opAnim, transform: [{ translateY: floatAnim }] }}
    >
      <Ionicons name="diamond" size={14} color={color} />
    </Animated.View>
  );
};

const BG_STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i, x: (i * 137 + 20) % (W - 30), y: (i * 113 + 40) % 1400,
  size: 5 + (i % 4) * 3, delay: i * 180,
}));

const GEM_POSITIONS = [
  { x: 18, y: 180, delay: 0 }, { x: W - 34, y: 320, delay: 600 },
  { x: 24, y: 500, delay: 300 }, { x: W - 28, y: 640, delay: 900 },
  { x: 16, y: 860, delay: 150 }, { x: W - 32, y: 1000, delay: 750 },
  { x: 22, y: 1180, delay: 450 }, { x: W - 26, y: 1320, delay: 1050 },
];

// ─── Milestone header (shown above certain levels) ────────────────────────────
const MilestoneHeader: React.FC<{ label: string; icon: string; color: string }> = ({ label, icon, color }) => (
  <View style={ms.wrap}>
    <View style={[ms.line, { backgroundColor: color + '44' }]} />
    <View style={[ms.badge, { backgroundColor: color + '1A', borderColor: color + '55' }]}>
      <Ionicons name={icon as any} size={11} color={color} />
      <Text style={[ms.text, { color }]}>{label}</Text>
    </View>
    <View style={[ms.line, { backgroundColor: color + '44' }]} />
  </View>
);
const ms = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '88%', marginVertical: 8 },
  line: { flex: 1, height: 1 },
  badge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  text: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
});

// Milestones shown ABOVE the corresponding level number in reversed (top-to-bottom = high-to-low) layout
const MILESTONES: Record<number, { labelKey: TranslationKey; icon: string }> = {
  16: { labelKey: 'milestoneAlmostThere', icon: 'flame' },
  11: { labelKey: 'milestoneHalfway',     icon: 'flash' },
  6:  { labelKey: 'milestoneWarmingUp',   icon: 'barbell' },
  1:  { labelKey: 'milestoneStartHere',   icon: 'flag' },
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export const LevelMapScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useI18n();
  const { worldId, worldName, worldColor } = route.params;
  const { progress } = useLevelProgress();
  const reduceMotion = useReducedMotion();
  const theme = getWorldTheme(worldId);
  const scrollRef = useRef<ScrollView>(null);

  const globalCurrent = progress?.current_level ?? 1;
  const globalHighest = progress?.highest_level_unlocked ?? 1;
  const worldStart = (worldId - 1) * LEVELS_PER_WORLD + 1;
  const currentWorldLevel = Math.max(1, Math.min(globalCurrent - worldStart + 1, LEVELS_PER_WORLD + 1));
  const highestWorldUnlocked = Math.max(0, Math.min(globalHighest - worldStart + 1, LEVELS_PER_WORLD));

  // Staggered entrance — animate in display order (top-to-bottom)
  const nodeAnims = useRef(
    Array.from({ length: LEVELS_PER_WORLD }, () => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.6),
    }))
  ).current;

  useEffect(() => {
    if (reduceMotion) { nodeAnims.forEach(a => { a.opacity.setValue(1); a.scale.setValue(1); }); return; }
    Animated.stagger(
      30,
      nodeAnims.map(a =>
        Animated.parallel([
          Animated.timing(a.opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.spring(a.scale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
        ])
      )
    ).start();
  }, [reduceMotion]);

  // Auto-scroll to current level after layout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!scrollRef.current) return;
      // displayLevels: reversed array, index 0 = level 20, index (LEVELS_PER_WORLD-1) = level 1
      // currentWorldLevel is at displayIndex = LEVELS_PER_WORLD - currentWorldLevel
      const displayIndex = LEVELS_PER_WORLD - currentWorldLevel;
      // Estimate Y position: trophy header ~140px + each slot ~SLOT_HEIGHT + milestones
      const milestonesAbove = Object.keys(MILESTONES)
        .map(Number)
        .filter(lvl => lvl > currentWorldLevel).length;
      const estimatedY = 140 + displayIndex * SLOT_HEIGHT + milestonesAbove * MILESTONE_HEIGHT;
      // Scroll so current node is in the middle of the screen
      const scrollY = Math.max(0, estimatedY - 250);
      scrollRef.current.scrollTo({ y: scrollY, animated: !reduceMotion });
    }, 500);
    return () => clearTimeout(timer);
  }, [currentWorldLevel, reduceMotion]);

  const handleNodePress = useCallback(async (wln: number) => {
    const worldEntry = WORLDS.find(w => w.worldId === worldId);
    const categoryName = worldEntry ? WORLD_THEMES[worldEntry.key].categoryName : null;
    const resolvedCategoryId = categoryName ? (await getCategoryId(categoryName)) : null;
    navigation.navigate('Game', {
      worldId,
      worldLevelNumber: wln,
      levelNumber: worldStart + wln - 1,
      categoryId: resolvedCategoryId ?? 'general',
    });
  }, [navigation, worldId, worldStart]);

  // Level data (ascending 1..20)
  const levels = Array.from({ length: LEVELS_PER_WORLD }, (_, i) => ({
    wln: i + 1,
    state: getLevelState(i + 1, currentWorldLevel, highestWorldUnlocked),
    stars: getMockStars(i + 1, currentWorldLevel),
    offsetX: X_OFFSETS[i % X_OFFSETS.length],
  }));

  // Display order: reversed — level 20 first (top), level 1 last (bottom)
  const displayLevels = [...levels].reverse();

  const completed = levels.filter(l => l.state === 'completed').length;
  const pct = Math.round((completed / LEVELS_PER_WORLD) * 100);

  return (
    <SafeAreaView testID="level-map-screen" style={styles.container} edges={['top']}>
      {/* ── Header ── */}
      <LinearGradient
        colors={[theme.dimColor, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t('goBack')}
        >
          <View style={styles.backCircle}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </View>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Ionicons name={theme.icon as any} size={20} color={theme.color} />
            <Text style={[styles.worldTitle, { color: theme.color }]}>{worldName}</Text>
          </View>
          <Text style={styles.worldSubtitle}>{t('levelsCompletedFmt').replace('{n}', String(completed)).replace('{total}', String(LEVELS_PER_WORLD))}</Text>
        </View>

        {/* Progress pill */}
        <View style={styles.pctPill}>
          <View style={[styles.pctFill, { width: `${pct}%` as `${number}%`, backgroundColor: theme.color }]} />
          <Text style={[styles.pctText, { color: theme.color }]}>{pct}%</Text>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.mapContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Background decoration */}
        {BG_STARS.map(s => (
          <BgStar key={s.id} {...s} color={theme.color} />
        ))}
        {GEM_POSITIONS.map((g, i) => (
          <FloatingGem key={i} {...g} color={theme.color} />
        ))}

        {/* ── Trophy (goal) at the top ── */}
        <View style={styles.worldTop}>
          <LinearGradient
            colors={[theme.dimColor, theme.dimColor + '00']}
            style={styles.worldTopGrad}
          >
            <View style={[styles.trophyWrap, { borderColor: theme.color + '66', backgroundColor: theme.dimColor }]}>
              <Ionicons name="trophy" size={40} color={theme.color} />
            </View>
            <Text style={[styles.worldTopTitle, { color: theme.color }]}>{t('worldCompleteTitle')}</Text>
            <Text style={styles.worldTopSub}>{t('worldCompleteHint').replace('{n}', String(LEVELS_PER_WORLD))}</Text>
          </LinearGradient>
        </View>

        {/* ── Level path (reversed: 20→1 top to bottom) ── */}
        <View style={styles.pathWrap}>
          {displayLevels.map(({ wln, state, stars, offsetX }, displayIndex) => {
            // The previous item in display order (higher level number)
            const prevDisplay = displayIndex > 0 ? displayLevels[displayIndex - 1] : null;
            // Connector is completed if this (lower) level AND the one above it are both completed
            const connectorCompleted = prevDisplay
              ? prevDisplay.state === 'completed' && state === 'completed'
              : false;

            const milestone = MILESTONES[wln];
            // Animation index: stagger from top to bottom as displayed
            const animIndex = displayIndex;

            return (
              <View key={wln} style={styles.nodeSlot}>
                {/* Milestone label above this level */}
                {milestone && (
                  <MilestoneHeader label={t(milestone.labelKey)} icon={milestone.icon} color={theme.color} />
                )}

                {/* Path connector from previous (above) to this node */}
                {prevDisplay && (
                  <PathConnector
                    fromX={prevDisplay.offsetX}
                    toX={offsetX}
                    completed={connectorCompleted}
                    color={theme.color}
                  />
                )}

                {/* Level node */}
                <Animated.View
                  style={[
                    styles.nodeWrap,
                    { marginLeft: offsetX },
                    {
                      opacity: nodeAnims[animIndex]?.opacity ?? new Animated.Value(1),
                      transform: [{ scale: nodeAnims[animIndex]?.scale ?? new Animated.Value(1) }],
                    },
                  ]}
                >
                  <LevelNode
                    levelNumber={wln}
                    state={state}
                    stars={stars}
                    color={theme.color}
                    dimColor={theme.dimColor}
                    gradient={theme.nodeGradient}
                    onPress={() => handleNodePress(wln)}
                  />
                </Animated.View>
              </View>
            );
          })}
        </View>

        {/* ── "Start" marker at the very bottom ── */}
        <View style={styles.worldBottom}>
          <View style={[styles.bottomLine, { backgroundColor: theme.color + '44' }]} />
          <View style={[styles.bottomBadge, { borderColor: theme.color + '55', backgroundColor: theme.color + '18' }]}>
            <Ionicons name="flag" size={16} color={theme.color} />
            <Text style={[styles.bottomText, { color: theme.color }]}>{t('mapBeginning')}</Text>
          </View>
          <View style={[styles.bottomLine, { backgroundColor: theme.color + '44' }]} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.surface2,
    borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flex: 1, gap: 2 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  worldTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  worldSubtitle: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  pctPill: {
    width: 56, height: 26, borderRadius: 13,
    backgroundColor: COLORS.surface2, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  pctFill: { position: 'absolute', left: 0, top: 0, height: '100%', opacity: 0.3 },
  pctText: { fontSize: 11, fontWeight: '800', zIndex: 1 },

  mapContent: { paddingBottom: 50, paddingTop: 8, alignItems: 'center' },
  pathWrap: { alignItems: 'center', width: '100%' },
  nodeSlot: { alignItems: 'center', width: '100%' },
  nodeWrap: {},

  // Trophy at top
  worldTop: { alignItems: 'center', width: '80%', marginBottom: 8 },
  worldTopGrad: { alignItems: 'center', padding: 20, borderRadius: 24, gap: 8, width: '100%' },
  trophyWrap: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1C1917', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4,
  },
  worldTopTitle: { fontSize: 18, fontWeight: '800' },
  worldTopSub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 17 },

  // "Beginning" at bottom
  worldBottom: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    width: '80%', marginTop: 16, marginBottom: 10,
  },
  bottomLine: { flex: 1, height: 1 },
  bottomBadge: {
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  bottomText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
});
