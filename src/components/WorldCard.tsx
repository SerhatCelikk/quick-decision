import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants';
import { StarRating } from './StarRating';

interface WorldCardProps {
  name: string;
  emoji: string;
  color: string;
  dimColor: string;
  tint: string;
  levelsCompleted: number;
  totalLevels: number;
  totalStars: number;
  maxStars: number;
  locked?: boolean;
  onPress?: () => void;
  testID?: string;
}

export const WorldCard: React.FC<WorldCardProps> = ({
  name,
  emoji,
  color,
  tint,
  levelsCompleted,
  totalLevels,
  totalStars,
  maxStars,
  locked = false,
  onPress,
  testID,
}) => {
  const progressPct = totalLevels > 0 ? (levelsCompleted / totalLevels) * 100 : 0;
  const starCount = Math.min(3, Math.round((totalStars / maxStars) * 3)) as 0 | 1 | 2 | 3;

  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.card, { borderColor: locked ? COLORS.border : color }, locked && styles.locked]}
      onPress={!locked ? onPress : undefined}
      disabled={locked}
      activeOpacity={0.82}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: tint }]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color }]}>{name}</Text>
          <Text style={styles.levels}>{levelsCompleted}/{totalLevels} levels</Text>
        </View>
        {locked ? (
          <Text style={styles.lockIcon}>🔒</Text>
        ) : (
          <View style={styles.starsSection}>
            <StarRating stars={starCount} size={13} />
            <Text style={styles.starsLabel}>{totalStars}/{maxStars} ⭐</Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={styles.body}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` as `${number}%`, backgroundColor: color }]} />
        </View>
        {locked && (
          <Text style={styles.lockHint}>Complete the previous world to unlock</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  locked: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  emoji: {
    fontSize: 34,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  levels: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  lockIcon: {
    fontSize: 22,
  },
  starsSection: {
    alignItems: 'center',
    gap: 3,
  },
  starsLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 6,
  },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  lockHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
