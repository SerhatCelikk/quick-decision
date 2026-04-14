import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, View, Animated, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../../types';
import { COLORS, PASS_THRESHOLD, WORLD_THEMES, WORLDS } from '../../constants';
import { useI18n } from '../../i18n';
import { EnergyBar } from '../../components/EnergyBar';
import { StarRating } from '../../components/StarRating';
import { DuoButton } from '../../components/common/DuoButton';
import { useInAppReview } from '../../hooks/useInAppReview';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Props = RootStackScreenProps<'LevelCompletion'>;
const { width: W } = Dimensions.get('window');

function getWorldTheme(worldId: number) {
  const w = WORLDS.find(w => w.worldId === worldId);
  return w ? WORLD_THEMES[w.key] : WORLD_THEMES.easy;
}

// ─── Confetti ──────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#FF4D00','#F97316','#10B981','#3B82F6','#F59E0B','#5B4BF5','#F43F5E','#06B6D4','#22C55E'];
const SHAPES = Array.from({ length: 50 }, (_, i) => ({
  id: i, x: Math.random() * W, delay: Math.random() * 600,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 5 + Math.random() * 9,
  isCircle: i % 3 !== 0,
  duration: 1600 + Math.random() * 600,
}));

// Emoji confetti pieces
const EMOJIS = ['🎉','⭐','🔥','💥','✨','🏆','💫','🎊'];
const EMOJI_SHAPES = Array.from({ length: 20 }, (_, i) => ({
  id: i + 100,
  x: Math.random() * W,
  delay: Math.random() * 400 + 100,
  emoji: EMOJIS[i % EMOJIS.length],
  duration: 1800 + Math.random() * 500,
}));

const Piece: React.FC<{ delay: number; x: number; color: string; size: number; isCircle: boolean; duration: number }> = ({
  delay, x, color, size, isCircle, duration,
}) => {
  const ty = useRef(new Animated.Value(-20)).current;
  const op = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(sc, { toValue: 1, tension: 200, friction: 6, useNativeDriver: true }),
        Animated.timing(op, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(ty, { toValue: 380 + Math.random() * 120, duration, useNativeDriver: true }),
        Animated.timing(rot, { toValue: 1, duration, useNativeDriver: true }),
      ]),
      Animated.timing(op, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${540 + Math.random() * 360}deg`] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', left: x, top: 0,
        width: size, height: isCircle ? size : size * 0.6,
        borderRadius: isCircle ? size / 2 : 2,
        backgroundColor: color,
        opacity: op,
        transform: [{ translateY: ty }, { rotate: spin }, { scale: sc }],
      }}
      importantForAccessibility="no"
      accessibilityElementsHidden
    />
  );
};

const EmojiPiece: React.FC<{ delay: number; x: number; emoji: string; duration: number }> = ({
  delay, x, emoji, duration,
}) => {
  const ty  = useRef(new Animated.Value(-20)).current;
  const op  = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(op,  { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(ty,  { toValue: 400 + Math.random() * 80, duration, useNativeDriver: true }),
        Animated.timing(rot, { toValue: 1, duration, useNativeDriver: true }),
      ]),
      Animated.timing(op, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '30deg'] });

  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute', left: x, top: 0,
        fontSize: 20, opacity: op,
        transform: [{ translateY: ty }, { rotate: spin }],
      }}
      importantForAccessibility="no"
      accessibilityElementsHidden
    >
      {emoji}
    </Animated.Text>
  );
};

const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {SHAPES.map(s => <Piece key={s.id} {...s} />)}
      {EMOJI_SHAPES.map(s => <EmojiPiece key={s.id} {...s} />)}
    </View>
  );
};

// ─── Animated stat card ────────────────────────────────────────────────────────
const StatCard: React.FC<{ value: string; label: string; color?: string; delay?: number; icon?: string }> = ({
  value, label, color, delay = 0, icon,
}) => {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 90, friction: 7, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.statCard, { opacity, transform: [{ scale }] }]}>
      {icon && <Ionicons name={icon as any} size={18} color={color ?? COLORS.textSecondary} />}
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────
export const LevelCompletionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { worldId, worldLevelNumber, levelNumber, correct, total, passed, accuracy, stars, nextLevel, energyRemaining } = route.params;
  const theme = getWorldTheme(worldId);
  const { t } = useI18n();
  const accuracyPct = Math.round(accuracy * 100);
  const passThresholdPct = Math.round(PASS_THRESHOLD * 100);
  const { maybeRequestReview } = useInAppReview();
  const reduceMotion = useReducedMotion();
  const xpEarned = passed ? Math.round(100 * (1 + stars * 0.5)) : 0;
  const [confetti, setConfetti] = React.useState(false);

  useEffect(() => { if (passed) maybeRequestReview(); }, [passed, maybeRequestReview]);

  // Card entrance
  const cardScale = useRef(new Animated.Value(reduceMotion ? 1 : 0.6)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;
  // XP bar fill
  const xpFill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      cardScale.setValue(1);
      Animated.timing(cardOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      xpFill.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.delay(350),
      Animated.timing(iconBounce, { toValue: -28, duration: 200, useNativeDriver: true }),
      Animated.spring(iconBounce, { toValue: 0, tension: 100, friction: 4, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(xpFill, { toValue: xpEarned / 250, duration: 700, useNativeDriver: false }),
    ]).start();
    if (passed) {
      const t1 = setTimeout(() => setConfetti(true), 280);
      const t2 = setTimeout(() => setConfetti(false), 3000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, []);

  const handleNext = () => navigation.replace('Game', { worldId, worldLevelNumber: worldLevelNumber + 1, levelNumber: nextLevel, categoryId: 'general' });
  const handleRetry = () => navigation.replace('Game', { worldId, worldLevelNumber, levelNumber, categoryId: 'general' });
  const handleMap = () => navigation.navigate('Main');

  const bgColors: readonly [string, string] = passed
    ? [theme.dimColor, COLORS.background]
    : [COLORS.dangerBg, COLORS.background];

  return (
    <SafeAreaView style={styles.container}>
      <Confetti active={confetti} />
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.card, { transform: [{ scale: cardScale }], opacity: cardOpacity }]}>

          {/* World badge */}
          <View style={[styles.worldBadge, { backgroundColor: theme.tint, borderColor: theme.color + '55' }]}>
            <Ionicons name={theme.icon as any} size={15} color={theme.color} />
            <Text style={[styles.worldBadgeText, { color: theme.color }]}>
              {theme.name} · Level {worldLevelNumber}
            </Text>
          </View>

          {/* Result icon */}
          <Animated.View
            style={[
              styles.resultIconBg,
              {
                backgroundColor: passed ? theme.dimColor : COLORS.dangerBg,
                transform: [{ translateY: iconBounce }],
                shadowColor: passed ? theme.color : COLORS.danger,
                shadowOpacity: 0.6,
                shadowRadius: 24,
              },
            ]}
          >
            <LinearGradient
              colors={passed ? theme.nodeGradient : ['#BE123C', '#F43F5E']}
              style={styles.resultIconGrad}
            >
              <Ionicons name={passed ? 'trophy' : 'close-circle'} size={52} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Text style={[styles.resultTitle, { color: passed ? theme.color : COLORS.danger }]}>
            {passed ? t('levelComplete') : t('almostThere')}
          </Text>
          <Text style={styles.resultSub}>
            {passed
              ? t('levelCompleteMsg')
              : `${t('passLabel')} ${passThresholdPct}% — ${accuracyPct}%`}
          </Text>

          {/* Stars */}
          {passed && (
            <View style={styles.starsRow}>
              <StarRating stars={stars} size={48} animated />
            </View>
          )}

          {/* XP earned */}
          {passed && xpEarned > 0 && (
            <View style={styles.xpRow}>
              <LinearGradient colors={['#CC9F00', '#FFD700']} style={styles.xpBadge}>
                <Ionicons name="flash" size={16} color="#FFD700" />
                <Text style={styles.xpText}>+{xpEarned} {t('xpEarned')}</Text>
              </LinearGradient>
              {/* XP fill bar */}
              <View style={styles.xpTrack}>
                <Animated.View
                  style={[
                    styles.xpFill,
                    { width: xpFill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <StatCard value={`${correct}/${total}`} label={t('correct')} icon="checkmark-circle" color={passed ? theme.color : COLORS.textSecondary} delay={200} />
            <StatCard value={`${accuracyPct}%`} label={t('accuracy')} icon="analytics" color={passed ? theme.color : COLORS.danger} delay={320} />
            <StatCard value={passed ? `Lv ${nextLevel}` : `Lv ${worldLevelNumber}`} label={passed ? t('next') : t('retry')} icon={passed ? 'arrow-up-circle' : 'refresh-circle'} color={COLORS.textSecondary} delay={440} />
          </View>

          {/* Accuracy bar with threshold marker */}
          <View style={styles.accSection}>
            <View style={styles.accBar}>
              <LinearGradient
                colors={passed ? theme.nodeGradient : ['#BE123C', '#F43F5E']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.accFill, { width: `${Math.min(accuracyPct, 100)}%` as `${number}%` }]}
              />
              <View style={[styles.accMarker, { left: `${passThresholdPct}%` as `${number}%` }]} />
            </View>
            <View style={styles.accLabels}>
              <Text style={styles.accLabel}>0%</Text>
              <Text style={[styles.accThreshLabel, { left: `${passThresholdPct - 14}%` as `${number}%` }]}>
                {t('passLabel')} {passThresholdPct}%
              </Text>
              <Text style={styles.accLabel}>100%</Text>
            </View>
          </View>

          {/* Hearts */}
          <View style={styles.heartsRow}>
            <Ionicons name="heart" size={15} color={COLORS.danger} />
            <Text style={styles.heartsLabel}>{t('heartsRemainingLabel')}</Text>
            <EnergyBar hearts={energyRemaining} size={18} />
          </View>

          {/* CTAs */}
          <View style={styles.ctaStack}>
            {passed ? (
              <DuoButton label={t('nextLevel')} variant="primary" onPress={handleNext}
                icon={<Ionicons name="arrow-forward" size={18} color="#fff" />} />
            ) : (
              <DuoButton label={t('tryAgain')} variant="danger" onPress={handleRetry}
                icon={<Ionicons name="refresh" size={18} color="#fff" />} />
            )}
            <DuoButton label={t('worldMap')} variant="secondary" onPress={handleMap}
              icon={<Ionicons name="map-outline" size={18} color={COLORS.text} />} />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 28 },

  card: {
    backgroundColor: COLORS.surface, borderRadius: 28, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#1C1917', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 18, elevation: 8,
    gap: 16,
  },

  worldBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  worldBadgeText: { fontSize: 13, fontWeight: '700' },

  resultIconBg: { width: 100, height: 100, borderRadius: 28, overflow: 'hidden', shadowColor: '#1C1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 12, elevation: 6 },
  resultIconGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  resultTitle: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 34, fontWeight: '900', textAlign: 'center', letterSpacing: -1 },
  resultSub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },

  starsRow: { flexDirection: 'row', gap: 8 },

  xpRow: { width: '100%', alignItems: 'center', gap: 8 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 12, elevation: 6 },
  xpText: { fontFamily: 'SpaceGrotesk_700Bold', color: '#1A1200', fontSize: 16, fontWeight: '800' },
  xpTrack: { width: '100%', height: 10, backgroundColor: COLORS.surface2, borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  xpFill: { position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 5, backgroundColor: COLORS.gold, shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 6 },

  statsGrid: { flexDirection: 'row', gap: 8, width: '100%' },
  statCard: { flex: 1, backgroundColor: COLORS.surface2, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 4 },
  statValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, fontWeight: '900', color: COLORS.text },
  statLabel: { fontFamily: 'NunitoSans_700Bold', fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: '700' },

  // Accuracy bar
  accSection: { width: '100%', gap: 6 },
  accBar: { width: '100%', height: 10, backgroundColor: COLORS.surface2, borderRadius: 5, overflow: 'visible', position: 'relative', borderWidth: 1, borderColor: COLORS.border },
  accFill: { position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 5 },
  accMarker: { position: 'absolute', top: -5, width: 2, height: 20, backgroundColor: COLORS.text, borderRadius: 1, opacity: 0.5, marginLeft: -1 },
  accLabels: { flexDirection: 'row', justifyContent: 'space-between', position: 'relative' },
  accLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  accThreshLabel: { position: 'absolute', fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', top: 0 },

  // Hearts
  heartsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', backgroundColor: COLORS.surface2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  heartsLabel: { flex: 1, fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },

  ctaStack: { width: '100%', gap: 10 },
});
