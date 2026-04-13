import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types/navigation';
import { COLORS, LEVELS_PER_WORLD } from '../../constants';
import { useLevelProgress } from '../../hooks/useLevelProgress';
import { LevelNode, type LevelNodeState } from '../../components/LevelNode';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Props = RootStackScreenProps<'LevelMap'>;

const STAGGER_MS = 50;

function getLevelState(
  worldLevelNumber: number,
  currentWorldLevel: number,
  highestWorldUnlocked: number
): LevelNodeState {
  if (worldLevelNumber < currentWorldLevel) return 'completed';
  if (worldLevelNumber === currentWorldLevel) return 'current';
  if (worldLevelNumber <= highestWorldUnlocked) return 'unlocked';
  return 'locked';
}

function getMockStars(worldLevelNumber: number, currentWorldLevel: number): 0 | 1 | 2 | 3 {
  if (worldLevelNumber >= currentWorldLevel) return 0;
  const mod = worldLevelNumber % 3;
  if (mod === 0) return 3;
  if (mod === 1) return 1;
  return 2;
}

// Alternating winding path offsets
function sideOffset(index: number): number {
  return index % 2 === 0 ? -36 : 36;
}

export const LevelMapScreen: React.FC<Props> = ({ navigation, route }) => {
  const { worldId, worldName, worldColor } = route.params;
  const { progress } = useLevelProgress();
  const reduceMotion = useReducedMotion();

  const globalCurrent = progress?.current_level ?? 1;
  const globalHighest = progress?.highest_level_unlocked ?? 1;

  const worldStart = (worldId - 1) * LEVELS_PER_WORLD + 1;
  const currentWorldLevel = Math.max(1, Math.min(globalCurrent - worldStart + 1, LEVELS_PER_WORLD + 1));
  const highestWorldUnlocked = Math.max(0, Math.min(globalHighest - worldStart + 1, LEVELS_PER_WORLD));

  // Staggered fade+slide animations
  const nodeAnims = useRef(
    Array.from({ length: LEVELS_PER_WORLD }, () => ({
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (reduceMotion) {
      // Snap all nodes visible immediately — no translate or stagger
      nodeAnims.forEach(a => {
        a.opacity.setValue(1);
        a.translateX.setValue(0);
      });
      return;
    }
    nodeAnims.forEach((a, i) => a.translateX.setValue(sideOffset(i)));
    const anims = nodeAnims.map((a, i) =>
      Animated.parallel([
        Animated.timing(a.opacity, { toValue: 1, duration: 280, delay: i * STAGGER_MS, useNativeDriver: true }),
        Animated.timing(a.translateX, { toValue: 0, duration: 280, delay: i * STAGGER_MS, useNativeDriver: true }),
      ])
    );
    Animated.stagger(STAGGER_MS, anims).start();
  }, [reduceMotion]);

  const handleNodePress = useCallback(
    (worldLevelNumber: number) => {
      const levelNumber = worldStart + worldLevelNumber - 1;
      navigation.navigate('Game', { worldId, worldLevelNumber, levelNumber, categoryId: 'general' });
    },
    [navigation, worldId, worldStart]
  );

  const levels = Array.from({ length: LEVELS_PER_WORLD }, (_, i) => {
    const wln = i + 1;
    return {
      worldLevelNumber: wln,
      state: getLevelState(wln, currentWorldLevel, highestWorldUnlocked),
      stars: getMockStars(wln, currentWorldLevel),
    };
  });

  // Find dim color from world (passed as color, derive dim by darkening mentally — use a static map)
  // Since we only pass worldColor, use it directly for node color/dimColor
  const nodeDimColor = `${worldColor}33`; // 20% alpha background approximation via hex

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={[styles.backIcon, { color: worldColor }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: worldColor }]}>{worldName}</Text>
        <View style={[styles.levelBadge, { borderColor: worldColor }]}>
          <Text style={[styles.levelBadgeText, { color: worldColor }]}>Lv {currentWorldLevel}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.mapContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pathColumn}>
          {levels.map(({ worldLevelNumber, state, stars }, index) => (
            <View key={worldLevelNumber} style={styles.nodeRow}>
              {/* Connector line between nodes */}
              {index > 0 && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor:
                        state === 'locked' ? COLORS.border : worldColor,
                    },
                  ]}
                />
              )}

              <Animated.View
                style={[
                  styles.nodeWrap,
                  { marginLeft: sideOffset(index) },
                  {
                    opacity: nodeAnims[index].opacity,
                    transform: [{ translateX: nodeAnims[index].translateX }],
                  },
                ]}
              >
                <LevelNode
                  levelNumber={worldLevelNumber}
                  state={state}
                  stars={stars}
                  color={worldColor}
                  dimColor={nodeDimColor}
                  onPress={() => handleNodePress(worldLevelNumber)}
                />
              </Animated.View>
            </View>
          ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  levelBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  mapContent: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  pathColumn: {
    alignItems: 'center',
    width: '100%',
  },
  nodeRow: {
    alignItems: 'center',
  },
  connector: {
    width: 3,
    height: 24,
    borderRadius: 2,
    marginVertical: -2,
  },
  nodeWrap: {},
});
