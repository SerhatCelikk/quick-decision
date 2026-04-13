import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { DuoButton } from '../common/DuoButton';

interface FactRevealProps {
  fact?: string | null;
  answerCorrect: boolean;
  timedOut: boolean;
  streak: number;
  onContinue: () => void;
}

export const FactReveal: React.FC<FactRevealProps> = ({
  fact, answerCorrect, timedOut, streak, onContinue,
}) => {
  const slideAnim  = useRef(new Animated.Value(140)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconScale  = useRef(new Animated.Value(0.3)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;

  const isCorrect = answerCorrect && !timedOut;
  const xpEarned = isCorrect ? 10 * Math.min(streak, 5) : 0;

  useEffect(() => {
    // Panel slides up
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    // Icon pops in
    Animated.sequence([
      Animated.delay(120),
      Animated.parallel([
        Animated.spring(iconScale, { toValue: 1, tension: 200, friction: 7, useNativeDriver: true }),
        Animated.timing(iconRotate, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const spin = iconRotate.interpolate({ inputRange: [0, 1], outputRange: ['-30deg', '0deg'] });

  const resultLabel = timedOut ? "Time's Up!"
    : isCorrect
    ? streak > 1 ? `${streak}x Streak!` : 'Correct!'
    : 'Wrong!';

  const topIcon = isCorrect ? 'checkmark-circle' : timedOut ? 'time' : 'close-circle';
  const iconColor = isCorrect ? COLORS.success : timedOut ? COLORS.warning : COLORS.danger;

  const bgColors: readonly [string, string] = isCorrect
    ? ['#00291A', '#001A10']
    : ['#2A0010', '#1A0008'];

  const accentColor = isCorrect ? '#10B981' : '#F43F5E';

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim, borderTopColor: accentColor },
      ]}
    >
      <LinearGradient colors={bgColors} style={styles.gradient}>
        {/* Verdict row */}
        <View style={styles.verdictRow}>
          <Animated.View style={{ transform: [{ scale: iconScale }, { rotate: spin }] }}>
            <View style={[styles.iconCircle, { backgroundColor: iconColor + '22', borderColor: iconColor + '55' }]}>
              <Ionicons name={topIcon as any} size={36} color={iconColor} />
            </View>
          </Animated.View>

          <View style={styles.verdictText}>
            <Text style={[styles.verdict, { color: iconColor }]}>{resultLabel}</Text>
            {!isCorrect && (
              <Text style={styles.encouragement}>
                {timedOut ? 'Answer faster next time!' : 'Keep going — you\'ve got this!'}
              </Text>
            )}
            {isCorrect && streak > 1 && (
              <View style={styles.streakDots}>
                {Array.from({ length: Math.min(streak, 5) }).map((_, i) => (
                  <View key={i} style={[styles.streakDot, { backgroundColor: COLORS.streak }]} />
                ))}
                {streak > 5 && <Text style={styles.streakExtra}>+{streak - 5}</Text>}
              </View>
            )}
          </View>

          {/* XP badge */}
          {xpEarned > 0 && (
            <View style={styles.xpBadge}>
              <Ionicons name="flash" size={12} color="#FFD700" />
              <Text style={styles.xpText}>+{xpEarned}</Text>
            </View>
          )}
        </View>

        {/* Fun fact */}
        {fact ? (
          <View style={[styles.factBox, { borderColor: accentColor + '44' }]}>
            <View style={styles.factHeader}>
              <Ionicons name="bulb" size={13} color="#F59E0B" />
              <Text style={styles.factTitle}>Did you know?</Text>
            </View>
            <Text style={styles.factBody}>{fact}</Text>
          </View>
        ) : !isCorrect ? (
          <View style={[styles.factBox, { borderColor: COLORS.border }]}>
            <View style={styles.factHeader}>
              <Ionicons name="information-circle" size={13} color={COLORS.textMuted} />
              <Text style={styles.factTitle}>Tip</Text>
            </View>
            <Text style={styles.factBody}>Read each option carefully — some are very close!</Text>
          </View>
        ) : null}

        {/* Continue button */}
        <DuoButton
          label="Continue"
          variant={isCorrect ? 'primary' : 'danger'}
          onPress={onContinue}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 2, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 16,
  },
  gradient: { paddingTop: 22, paddingHorizontal: 20, paddingBottom: 38, gap: 16 },

  verdictRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 62, height: 62, borderRadius: 31, borderWidth: 1, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  verdictText: { flex: 1, gap: 4 },
  verdict: { fontSize: 22, fontWeight: '900' },
  encouragement: { fontSize: 13, color: COLORS.textSecondary },
  streakDots: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  streakDot: { width: 10, height: 10, borderRadius: 5 },
  streakExtra: { fontSize: 11, fontWeight: '800', color: COLORS.streak },

  xpBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#CC7A00', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, flexShrink: 0,
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 3,
  },
  xpText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  factBox: { borderWidth: 1, borderRadius: 14, padding: 14, backgroundColor: 'rgba(0,0,0,0.25)', gap: 6 },
  factHeader: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  factTitle: { fontSize: 10, fontWeight: '800', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: 0.8 },
  factBody: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
});
