import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { TabScreenProps } from '../../types/navigation';
import { COLORS, WORLD_THEMES, WORLDS, LEVELS_PER_WORLD } from '../../constants';
import { useLevelProgress } from '../../hooks/useLevelProgress';
import { useEnergy } from '../../hooks/useEnergy';
import { EnergyBar } from '../../components/EnergyBar';
import { WorldCard } from '../../components/WorldCard';
import { DailyChallengeBanner } from '../../components/DailyChallengeBanner';

type Props = TabScreenProps<'WorldMap'>;

export const WorldMapScreen: React.FC<Props> = ({ navigation }) => {
  const { progress } = useLevelProgress();
  const { hearts, maxHearts, secondsUntilRegen, refillHearts } = useEnergy();

  const currentLevel = progress?.current_level ?? 1;

  // Slide-up animations for cards on mount
  const slideAnims = useRef(WORLDS.map(() => new Animated.Value(40))).current;
  const fadeAnims = useRef(WORLDS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = WORLDS.map((_, i) =>
      Animated.parallel([
        Animated.timing(slideAnims[i], {
          toValue: 0,
          duration: 350,
          delay: i * 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: 350,
          delay: i * 100,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.stagger(80, anims).start();
  }, []);

  // Derive per-world progress from the flat global level
  // World 1: levels 1-20, World 2: 21-40, World 3: 41-60
  function getWorldProgress(worldId: number) {
    const startLevel = (worldId - 1) * LEVELS_PER_WORLD + 1;
    const completed = Math.max(0, Math.min(currentLevel - startLevel, LEVELS_PER_WORLD));
    const isLocked = currentLevel < startLevel && worldId > 1;
    // Mock star count until CHO-77 backend lands
    const totalStars = completed * 2;
    const maxStars = LEVELS_PER_WORLD * 3;
    return { completed, isLocked, totalStars, maxStars };
  }

  const handleWorldPress = useCallback(
    (worldId: number, name: string, color: string) => {
      navigation.navigate('LevelMap', { worldId, worldName: name, worldColor: color });
    },
    [navigation]
  );

  // Mock ad completion — refills hearts
  const handleWatchAd = useCallback(() => {
    refillHearts();
  }, [refillHearts]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quick Decision</Text>
        <Text style={styles.subtitle}>Choose your world</Text>
      </View>

      {/* Energy bar */}
      <View style={styles.energySection}>
        <EnergyBar
          hearts={hearts}
          maxHearts={maxHearts}
          size={24}
          secondsUntilRegen={hearts < maxHearts ? secondsUntilRegen : undefined}
          onWatchAd={hearts <= 0 ? handleWatchAd : undefined}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily challenge banner */}
        <DailyChallengeBanner />

        {WORLDS.map((world, i) => {
          const theme = WORLD_THEMES[world.key];
          const { completed, isLocked, totalStars, maxStars } = getWorldProgress(world.worldId);

          return (
            <Animated.View
              key={world.worldId}
              style={{
                opacity: fadeAnims[i],
                transform: [{ translateY: slideAnims[i] }],
              }}
            >
              <WorldCard
                name={theme.name}
                emoji={theme.emoji}
                color={theme.color}
                dimColor={theme.dimColor}
                tint={theme.tint}
                levelsCompleted={completed}
                totalLevels={LEVELS_PER_WORLD}
                totalStars={totalStars}
                maxStars={maxStars}
                locked={isLocked}
                onPress={() => handleWorldPress(world.worldId, theme.name, theme.color)}
              />
            </Animated.View>
          );
        })}

        {/* Coming soon */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonIcon}>✦</Text>
          <View>
            <Text style={styles.comingSoonTitle}>More worlds coming soon</Text>
            <Text style={styles.comingSoonSub}>Memes · Guinness · Pop Culture</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  energySection: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },
  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  comingSoonIcon: {
    fontSize: 26,
    color: COLORS.textMuted,
  },
  comingSoonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  comingSoonSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
