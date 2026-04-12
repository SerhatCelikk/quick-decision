import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import { useLevelProgress } from '../../hooks/useLevelProgress';
import { COLORS, PASS_THRESHOLD } from '../../constants';

type Props = RootStackScreenProps<'Main'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { progress, loading } = useLevelProgress();

  const currentLevel = progress?.current_level ?? 1;
  const highestUnlocked = progress?.highest_level_unlocked ?? 1;

  const handleStartGame = () => {
    navigation.navigate('Game', { categoryId: 'general', levelNumber: currentLevel });
  };

  const passThresholdPct = Math.round(PASS_THRESHOLD * 100);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Quick Decision</Text>
      <Text style={styles.subtitle}>Test your speed and knowledge</Text>

      {/* Level indicator card */}
      <View style={styles.levelCard}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} />
        ) : (
          <>
            <View style={styles.levelRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>Level {currentLevel}</Text>
              </View>
              {highestUnlocked > currentLevel && (
                <Text style={styles.unlockedText}>
                  Up to Level {highestUnlocked} unlocked
                </Text>
              )}
            </View>

            <Text style={styles.progressLabel}>
              Pass {passThresholdPct}% of questions to advance
            </Text>

            {/* Simple progress bar showing position in unlocked levels */}
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width:
                      highestUnlocked > 1
                        ? `${Math.min(((currentLevel - 1) / (highestUnlocked - 1)) * 100, 100)}%`
                        : '0%',
                  },
                ]}
              />
            </View>
            <Text style={styles.progressSubLabel}>
              {currentLevel === highestUnlocked
                ? 'New territory — this is your frontier!'
                : `Level ${currentLevel} of ${highestUnlocked} unlocked`}
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleStartGame}>
        <Text style={styles.buttonText}>Play Now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginBottom: 32,
  },
  levelCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    minHeight: 100,
    justifyContent: 'center',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 10,
  },
  levelBadge: {
    backgroundColor: '#312e81',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  levelBadgeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#a5b4fc',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  unlockedText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  progressLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#0f172a',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressSubLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
