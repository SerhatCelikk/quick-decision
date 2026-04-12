import React, { useEffect, useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import { COLORS, PASS_THRESHOLD } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = RootStackScreenProps<'LevelCompletion'>;

export const LevelCompletionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { levelNumber, correct, total, passed, accuracy, nextLevel } = route.params;

  const accuracyPct = Math.round(accuracy * 100);

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
      categoryId: 'general',
      levelNumber: nextLevel,
    });
  };

  const handleTryAgain = () => {
    navigation.replace('Game', {
      categoryId: 'general',
      levelNumber: levelNumber,
    });
  };

  const handleHome = () => {
    navigation.navigate('Main');
  };

  const passThresholdPct = Math.round(PASS_THRESHOLD * 100);

  return (
    <SafeAreaView style={styles.container}>
      {/* Confetti overlay for pass state */}
      {passed && (
        <Animated.View style={[styles.confettiOverlay, { opacity: confettiOpacity }]}>
          <Text style={styles.confettiEmoji}>🎉 🎊 ✨ 🎉 🎊 ✨ 🎉</Text>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: cardScale }], opacity: cardOpacity },
        ]}
      >
        {/* Level badge */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>Level {levelNumber}</Text>
        </View>

        {/* Pass / Fail header */}
        <Text style={[styles.resultTitle, passed ? styles.passTitle : styles.failTitle]}>
          {passed ? 'Level Complete!' : 'So Close!'}
        </Text>
        <Text style={styles.resultSubtitle}>
          {passed
            ? 'You crushed it — next level unlocked'
            : `Need ${passThresholdPct}% to pass — you got ${accuracyPct}%`}
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {correct} / {total}
            </Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>

          <View style={[styles.statBox, styles.statBoxCenter]}>
            <Text
              style={[
                styles.statValue,
                passed ? styles.passAccuracy : styles.failAccuracy,
              ]}
            >
              {accuracyPct}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {passed ? `Lv ${nextLevel}` : `Lv ${levelNumber}`}
            </Text>
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
                backgroundColor: passed ? '#22c55e' : '#ef4444',
              },
            ]}
          />
          {/* Pass threshold marker */}
          <View style={[styles.thresholdMarker, { left: `${passThresholdPct}%` as `${number}%` }]} />
        </View>
        <Text style={styles.accuracyBarLabel}>
          Pass threshold: {passThresholdPct}%
        </Text>

        {/* CTAs */}
        <View style={styles.ctaContainer}>
          {passed ? (
            <TouchableOpacity
              style={[styles.primaryButton, styles.passButton]}
              onPress={handleNextLevel}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Next Level →</Text>
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
            style={styles.homeButton}
            onPress={handleHome}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    padding: 28,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  levelBadge: {
    backgroundColor: '#312e81',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
  },
  levelBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a5b4fc',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  passTitle: {
    color: '#22c55e',
  },
  failTitle: {
    color: '#f97316',
  },
  resultSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statBoxCenter: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  passAccuracy: {
    color: '#22c55e',
  },
  failAccuracy: {
    color: '#ef4444',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  accuracyBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#0f172a',
    borderRadius: 4,
    overflow: 'visible',
    marginBottom: 6,
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
    backgroundColor: '#f8fafc',
    borderRadius: 1,
    marginLeft: -1,
  },
  accuracyBarLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  ctaContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: '#15803d',
  },
  retryButton: {
    backgroundColor: '#b45309',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  homeButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  homeButtonText: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
});
