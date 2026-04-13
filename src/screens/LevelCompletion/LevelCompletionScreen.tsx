import React, { useEffect, useRef } from 'react';
import {
  Text,
  StyleSheet,
  View,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import { COLORS, PASS_THRESHOLD, WORLD_THEMES, WORLDS } from '../../constants';
import { EnergyBar } from '../../components/EnergyBar';
import { StarRating } from '../../components/StarRating';
import { DuoButton } from '../../components/common/DuoButton';
import { useInAppReview } from '../../hooks/useInAppReview';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Props = RootStackScreenProps<'LevelCompletion'>;

function getWorldTheme(worldId: number) {
  const world = WORLDS.find(w => w.worldId === worldId);
  return world ? WORLD_THEMES[world.key] : WORLD_THEMES.easy;
}

// ─── Confetti particle ────────────────────────────────────────────────────────
const CONFETTI_CHARS = ['★', '●', '■', '▲', '◆'];
const CONFETTI_COLORS = [
  COLORS.brandGreen,
  COLORS.brandBlue,
  COLORS.brandYellow,
  COLORS.brandPurple,
  COLORS.brandOrange,
  COLORS.brandRed,
];

const ConfettiPiece: React.FC<{
  delay: number;
  x: number;
  color: string;
  char: string;
}> = ({ delay, x, color, char }) => {
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 320, duration: 1800, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [delay, translateY, opacity, rotate]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        fontSize: 16,
        color,
        transform: [{ translateY }, { rotate: spin }],
        opacity,
      }}
      importantForAccessibility="no"
      accessibilityElementsHidden
    >
      {char}
    </Animated.Text>
  );
};

// 30 particles per burst
const CONFETTI_PIECES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  delay: Math.floor(Math.random() * 600),
  x: Math.floor(Math.random() * 340),
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  char: CONFETTI_CHARS[i % CONFETTI_CHARS.length],
}));

const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {CONFETTI_PIECES.map(p => (
        <ConfettiPiece
          key={p.id}
          delay={p.delay}
          x={p.x}
          color={p.color}
          char={p.char}
        />
      ))}
    </View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export const LevelCompletionScreen: React.FC<Props> = ({ navigation, route }) => {
  const {
    worldId,
    worldLevelNumber,
    levelNumber,
    correct,
    total,
    passed,
    accuracy,
    stars,
    nextLevel,
    energyRemaining,
  } = route.params;

  const theme = getWorldTheme(worldId);
  const accuracyPct = Math.round(accuracy * 100);
  const passThresholdPct = Math.round(PASS_THRESHOLD * 100);
  const { maybeRequestReview } = useInAppReview();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (passed) maybeRequestReview();
  }, [passed, maybeRequestReview]);
  const xpEarned = passed ? Math.round(100 * (1 + stars * 0.5)) : 0;

  const cardScale = useRef(new Animated.Value(reduceMotion ? 1 : 0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const [showConfetti, setShowConfetti] = React.useState(false);

  useEffect(() => {
    if (reduceMotion) {
      // Reduced motion: instant appear, no spring, no confetti
      cardScale.setValue(1);
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    if (passed) {
      // Trigger confetti 200ms after card pops in, auto-hide after 2.5s
      const showTimer = setTimeout(() => setShowConfetti(true), 200);
      const hideTimer = setTimeout(() => setShowConfetti(false), 2700);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [cardScale, cardOpacity, passed, reduceMotion]);

  const handleNextLevel = () => {
    navigation.replace('Game', {
      worldId,
      worldLevelNumber: worldLevelNumber + 1,
      levelNumber: nextLevel,
      categoryId: 'general',
    });
  };

  const handleTryAgain = () => {
    navigation.replace('Game', {
      worldId,
      worldLevelNumber,
      levelNumber,
      categoryId: 'general',
    });
  };

  const handleWorldMap = () => {
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Confetti particle burst (§6.4) */}
      <Confetti active={showConfetti} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[styles.card, { transform: [{ scale: cardScale }], opacity: cardOpacity }]}
        >
          {/* World + level badge */}
          <View style={[styles.worldBadge, { backgroundColor: theme.tint, borderColor: theme.color }]}>
            <Text style={styles.worldEmoji}>{theme.emoji}</Text>
            <Text style={[styles.worldBadgeText, { color: theme.color }]}>
              {theme.name} · Level {worldLevelNumber}
            </Text>
          </View>

          {/* Result title */}
          <Text style={[styles.resultTitle, { color: passed ? theme.color : COLORS.brandOrange }]}>
            {passed ? 'Level Complete!' : 'So Close!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {passed
              ? 'You crushed it — next level unlocked!'
              : `Need ${passThresholdPct}% to pass — you got ${accuracyPct}%`}
          </Text>

          {/* Animated star reveal (§5.6, §6.4) */}
          {passed && (
            <View style={styles.starsRow}>
              <StarRating stars={stars} size={44} animated />
            </View>
          )}

          {/* XP badge */}
          {passed && xpEarned > 0 && (
            <View style={[styles.xpBadge, { backgroundColor: COLORS.brandPurple }]}>
              <Text style={styles.xpText}>+{xpEarned} XP earned</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{correct}/{total}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxCenter]}>
              <Text style={[styles.statValue, { color: passed ? theme.color : COLORS.brandRed }]}>
                {accuracyPct}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{passed ? `Lv ${nextLevel}` : `Lv ${worldLevelNumber}`}</Text>
              <Text style={styles.statLabel}>{passed ? 'Next' : 'Retry'}</Text>
            </View>
          </View>

          {/* Accuracy bar */}
          <View style={styles.accuracyBarTrack}>
            <View
              style={[
                styles.accuracyBarFill,
                {
                  width: `${Math.min(accuracyPct, 100)}%` as `${number}%`,
                  backgroundColor: passed ? theme.color : COLORS.brandRed,
                },
              ]}
            />
            <View style={[styles.thresholdMarker, { left: `${passThresholdPct}%` as `${number}%` }]} />
          </View>
          <Text style={styles.accuracyBarLabel}>Pass threshold: {passThresholdPct}%</Text>

          {/* Energy remaining */}
          <View style={styles.energyRow}>
            <Text style={styles.energyLabel}>Hearts remaining</Text>
            <EnergyBar hearts={energyRemaining} size={18} />
          </View>

          {/* CTAs — DuoButton with 3D press (§5.1) */}
          <View style={styles.ctaContainer}>
            {passed ? (
              <DuoButton label="Next Level →" variant="primary" onPress={handleNextLevel} />
            ) : (
              <DuoButton label="Try Again" variant="danger" onPress={handleTryAgain} />
            )}
            <DuoButton label="World Map" variant="secondary" onPress={handleWorldMap} />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    gap: 14,
  },

  // World badge
  worldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  worldEmoji: {
    fontSize: 18,
  },
  worldBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Title
  resultTitle: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Stars
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },

  // XP badge
  xpBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statBoxCenter: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Accuracy bar
  accuracyBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
  },
  accuracyBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 4,
  },
  thresholdMarker: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 16,
    backgroundColor: COLORS.text,
    borderRadius: 1,
    marginLeft: -1,
  },
  accuracyBarLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    alignSelf: 'flex-start',
  },

  // Energy row
  energyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  energyLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  // CTAs
  ctaContainer: {
    width: '100%',
    gap: 10,
  },
});
