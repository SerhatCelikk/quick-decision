import React, { useEffect, useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import { COLORS, PASS_THRESHOLD, WORLD_THEMES, WORLDS } from '../../constants';
import { EnergyBar } from '../../components/EnergyBar';
import { StarRating } from '../../components/StarRating';

type Props = RootStackScreenProps<'LevelCompletion'>;

function getWorldTheme(worldId: number) {
  const world = WORLDS.find(w => w.worldId === worldId);
  return world ? WORLD_THEMES[world.key] : WORLD_THEMES.easy;
}

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

  // Entry animations
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(confettiOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(confettiOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cardScale, cardOpacity, confettiOpacity, passed]);

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
      {/* Confetti overlay */}
      {passed && (
        <Animated.View style={[styles.confettiOverlay, { opacity: confettiOpacity }]}>
          <Text style={styles.confettiEmoji}>🎉 🎊 ✨ 🎉 🎊 ✨ 🎉</Text>
        </Animated.View>
      )}

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
          <Text style={[styles.resultTitle, { color: passed ? theme.color : '#f97316' }]}>
            {passed ? 'Level Complete!' : 'So Close!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {passed
              ? 'You crushed it — next level unlocked!'
              : `Need ${passThresholdPct}% to pass — you got ${accuracyPct}%`}
          </Text>

          {/* Stars */}
          {passed && (
            <View style={styles.starsRow}>
              <StarRating stars={stars} size={40} animated />
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{correct}/{total}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxCenter]}>
              <Text style={[styles.statValue, { color: passed ? theme.color : '#ef4444' }]}>
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
                  backgroundColor: passed ? theme.color : '#ef4444',
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

          {/* CTAs */}
          <View style={styles.ctaContainer}>
            {passed ? (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.dimColor, borderColor: theme.color, borderWidth: 1 }]}
                onPress={handleNextLevel}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryButtonText, { color: theme.color }]}>Next Level →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, styles.retryButton]}
                onPress={handleTryAgain}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleWorldMap}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>🗺 World Map</Text>
            </TouchableOpacity>
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
  confettiOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  confettiEmoji: {
    fontSize: 28,
    letterSpacing: 4,
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
    gap: 16,
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
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#92400e',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
