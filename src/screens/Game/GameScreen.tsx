import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Text, StyleSheet, TouchableOpacity, Animated, View,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../../types';
import type { Question } from '../../types';
import { getLevelConfig, COLORS, WORLD_THEMES, WORLDS } from '../../constants';
import { useI18n } from '../../i18n';
import { fetchQuestionsForLevel, submitLevelAttempt } from '../../services/gameService';
import { useEnergy } from '../../hooks/useEnergy';
import { EnergyBar } from '../../components/EnergyBar';
import { OptionButton } from '../../components/game/OptionButton';
import { FactReveal } from '../../components/game/FactReveal';
import { FloatingScore } from '../../components/game/FloatingScore';

type AnswerState = 'idle' | 'correct' | 'wrong';
type GamePhase = 'loading' | 'playing' | 'selected' | 'fact_reveal' | 'submitting' | 'no_energy';
type Props = RootStackScreenProps<'Game'>;

const { width: W, height: H } = Dimensions.get('window');

function getWorldTheme(worldId: number) {
  const w = WORLDS.find(w => w.worldId === worldId);
  return w ? WORLD_THEMES[w.key] : WORLD_THEMES.easy;
}
function getStars(accuracy: number): 0 | 1 | 2 | 3 {
  if (accuracy >= 1.0) return 3;
  if (accuracy >= 0.9) return 2;
  if (accuracy >= 0.75) return 1;
  return 0;
}

// ─── Ambient background particles ─────────────────────────────────────────────
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * W,
  size: 2 + (i % 4) * 1.5,
  duration: 7000 + i * 600,
  delay: i * 320,
  opacity: 0.1 + (i % 4) * 0.07,
  isSquare: i % 4 === 3,                          // every 4th is a square
  driftX: Math.sin(i) * 28,                       // horizontal sway amplitude
}));

const AmbientBg: React.FC<{ color: string }> = ({ color }) => {
  const anims  = useRef(PARTICLES.map(() => new Animated.Value(0))).current;
  const drifts = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    anims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(PARTICLES[i].delay),
          Animated.timing(anim, { toValue: 1, duration: PARTICLES[i].duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
      // Lateral sway — independent loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(drifts[i], { toValue: 1, duration: PARTICLES[i].duration * 0.6, useNativeDriver: true }),
          Animated.timing(drifts[i], { toValue: -1, duration: PARTICLES[i].duration * 0.6, useNativeDriver: true }),
        ])
      ).start();
    });
    return () => { anims.forEach(a => a.stopAnimation()); drifts.forEach(d => d.stopAnimation()); };
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['#4F46E5', '#4338CA', '#3B35BC']}
        style={StyleSheet.absoluteFill}
      />
      {PARTICLES.map((p, i) => {
        const ty  = anims[i].interpolate({ inputRange: [0, 1], outputRange: [H, -p.size * 4] });
        const op  = anims[i].interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, p.opacity, p.opacity, 0] });
        const tx  = drifts[i].interpolate({ inputRange: [-1, 1], outputRange: [-p.driftX, p.driftX] });
        const particleColor = i % 2 === 0 ? color + '55' : color + '33';
        return (
          <Animated.View
            key={p.id}
            style={{
              position: 'absolute', left: p.x, width: p.size, height: p.size,
              borderRadius: p.isSquare ? 2 : p.size / 2,
              backgroundColor: particleColor,
              opacity: op, transform: [{ translateY: ty }, { translateX: tx }],
            }}
          />
        );
      })}
    </View>
  );
};

// ─── Circular countdown timer ──────────────────────────────────────────────────
const CircleTimer: React.FC<{ timeLeft: number; total: number }> = ({ timeLeft, total }) => {
  const { t } = useI18n();
  const pct = timeLeft / total;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const prevPct = useRef(pct);

  // Color zones: blue (safe) → orange (warning) → red (danger)
  const color = pct > 0.5 ? COLORS.timerSafe : pct > 0.25 ? COLORS.timerWarning : COLORS.timerDanger;

  useEffect(() => {
    if (timeLeft <= Math.ceil(total * 0.25) && timeLeft > 0) {
      const a = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 380, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
        ])
      );
      a.start();
      return () => a.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timeLeft <= Math.ceil(total * 0.25)]);

  const timerGlow = {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: pct < 0.25 ? 0.8 : 0.3,
    shadowRadius: pct < 0.25 ? 16 : 8,
    elevation: 8,
  };

  return (
    <Animated.View style={[tStyles.wrap, timerGlow, { transform: [{ scale: pulseAnim }] }]}>
      <LinearGradient
        colors={pct > 0.5 ? ['#1D4ED8', COLORS.timerSafe] : pct > 0.25 ? ['#C2410C', COLORS.timerWarning] : ['#9F1239', COLORS.timerDanger]}
        style={tStyles.grad}
      >
        <View style={tStyles.innerMask}>
          <Text style={[tStyles.num, { color }]}>{timeLeft}</Text>
          <Text style={[tStyles.unit, { color: color + 'AA' }]}>{t('sec')}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};
const tStyles = StyleSheet.create({
  wrap: {
    width: 66, height: 66, borderRadius: 33, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 8,
  },
  grad: { flex: 1, padding: 3 },
  innerMask: {
    flex: 1, borderRadius: 30, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
  },
  num:  { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, fontWeight: '900', lineHeight: 26 },
  unit: { fontFamily: 'NunitoSans_700Bold', fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});

// ─── Score display ─────────────────────────────────────────────────────────────
const ScoreDisplay: React.FC<{ score: number; color: string }> = ({ score, color }) => {
  const popAnim = useRef(new Animated.Value(1)).current;
  const prevScore = useRef(score);

  useEffect(() => {
    if (score !== prevScore.current) {
      prevScore.current = score;
      Animated.sequence([
        Animated.timing(popAnim, { toValue: 1.4, duration: 100, useNativeDriver: true }),
        Animated.spring(popAnim, { toValue: 1, tension: 350, friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, [score]);

  return (
    <Animated.View style={{ transform: [{ scale: popAnim }] }}>
      <View style={sStyles.chip}>
        <Ionicons name="flash" size={12} color={COLORS.gold} />
        <Text style={[sStyles.val, { color }]}>{score.toLocaleString()}</Text>
      </View>
    </Animated.View>
  );
};
const sStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.surface2, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  val: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, fontWeight: '900' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export const GameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { worldId, worldLevelNumber, levelNumber, categoryId } = route.params;
  const levelConfig = getLevelConfig(levelNumber);
  const theme = getWorldTheme(worldId);
  const { t } = useI18n();

  const { hearts, maxHearts, secondsUntilRegen, loseHeart, refillHearts } = useEnergy();

  const [questions, setQuestions]       = useState<Question[]>([]);
  const [phase, setPhase]               = useState<GamePhase>('loading');
  const [loadError, setLoadError]       = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft]         = useState(levelConfig.timerSeconds);
  const [score, setScore]               = useState(0);
  const [streak, setStreak]             = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answerState, setAnswerState]   = useState<AnswerState>('idle');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Floating score
  const [scorePopup, setScorePopup] = useState<{ id: number; pts: number; streak: number } | null>(null);
  const popupIdRef = useRef(0);

  const fadeAnim    = useRef(new Animated.Value(1)).current;
  const slideAnim   = useRef(new Animated.Value(0)).current;
  const timerBarAnim = useRef(new Animated.Value(1)).current;

  const timerBarAnimRef  = useRef<Animated.CompositeAnimation | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAnsweredRef    = useRef(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion  = currentIndex >= questions.length - 1;
  const timerDuration   = levelConfig.timerSeconds;

  // Load questions
  useEffect(() => {
    if (hearts <= 0) { setPhase('no_energy'); return; }
    setPhase('loading'); setLoadError(null);
    let cancelled = false;
    fetchQuestionsForLevel(categoryId, {
      levelNumber,
      questionCount: levelConfig.questionCount,
      timerSeconds: levelConfig.timerSeconds,
      difficulty: levelNumber <= 20 ? 'easy' : levelNumber <= 40 ? 'medium' : 'hard',
    })
      .then(qs => { if (!cancelled) { setQuestions(qs); setPhase('playing'); } })
      .catch(() => { if (!cancelled) { setLoadError('Connection error. Please try again.'); setPhase('loading'); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    if (timerBarAnimRef.current) timerBarAnimRef.current.stop();
  }, []);

  const finishGame = useCallback(async (finalCorrect: number) => {
    setPhase('submitting');
    const total = questions.length;
    const result = await submitLevelAttempt({ levelNumber, questionsCorrect: finalCorrect, questionsTotal: total });
    const accuracy = total > 0 ? finalCorrect / total : 0;
    const passed = accuracy >= 0.75;
    const nextLevel = result?.next_level ?? (passed ? levelNumber + 1 : levelNumber);
    navigation.replace('LevelCompletion', {
      worldId, worldLevelNumber, levelNumber, correct: finalCorrect, total,
      passed, accuracy, stars: getStars(accuracy), nextLevel, energyRemaining: hearts,
    });
  }, [questions.length, levelNumber, worldId, worldLevelNumber, hearts, navigation]);

  const advanceQuestion = useCallback((latestCorrect: number) => {
    if (isLastQuestion) { finishGame(latestCorrect); return; }
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -28, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setCurrentIndex(p => p + 1);
      setTimeLeft(timerDuration);
      setAnswerState('idle');
      setSelectedIndex(null);
      setPhase('playing');
      isAnsweredRef.current = false;
      timerBarAnim.setValue(1);
      slideAnim.setValue(28);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    });
  }, [isLastQuestion, fadeAnim, timerBarAnim, slideAnim, finishGame, timerDuration]);

  const handleContinue = useCallback(() => advanceQuestion(correctCount), [advanceQuestion, correctCount]);

  const handleAnswer = useCallback((choiceIndex: number, timedOut = false) => {
    if (isAnsweredRef.current) return;
    isAnsweredRef.current = true;
    stopTimer();

    const isCorrect = !timedOut && choiceIndex === currentQuestion.correctIndex;

    // Step 1: show 'selected' state briefly for game tension
    if (!timedOut) {
      setSelectedIndex(choiceIndex);
      setPhase('selected');
    }

    // Step 2: after brief hold, reveal result
    const revealDelay = timedOut ? 0 : 280;
    setTimeout(() => {
      setAnswerState(isCorrect ? 'correct' : 'wrong');

      let newCorrect = correctCount;
      if (isCorrect) {
        const newStreak = streak + 1;
        const pts = Math.floor(100 * (1 + (newStreak - 1) * 0.5));
        setScore(p => p + pts);
        setStreak(newStreak);
        newCorrect = correctCount + 1;
        setCorrectCount(newCorrect);
        setScorePopup({ id: ++popupIdRef.current, pts, streak: newStreak });
      } else {
        setStreak(0);
        loseHeart();
      }
      setPhase('fact_reveal');
    }, revealDelay);
  }, [currentQuestion, streak, correctCount, stopTimer, loseHeart]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || questions.length === 0) return;
    isAnsweredRef.current = false;
    setTimeLeft(timerDuration);
    timerBarAnim.setValue(1);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(timerIntervalRef.current!); timerIntervalRef.current = null; handleAnswer(-1, true); return 0; }
        return p - 1;
      });
    }, 1000);

    timerBarAnimRef.current = Animated.timing(timerBarAnim, { toValue: 0, duration: timerDuration * 1000, useNativeDriver: false });
    timerBarAnimRef.current.start();

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timerBarAnimRef.current) timerBarAnimRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, phase === 'playing', questions.length]);

  // Timer bar: blue → orange → red
  const timerBarColor = timerBarAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 1],
    outputRange: [COLORS.timerDanger, COLORS.timerWarning, COLORS.timerWarning, COLORS.timerSafe],
  });

  // ── No energy ──────────────────────────────────────────────────────────────
  if (phase === 'no_energy') {
    return (
      <SafeAreaView style={styles.container}>
        <AmbientBg color={COLORS.danger} />
        <View style={styles.centeredFull}>
          <View style={styles.gateCard}>
            <View style={[styles.gateIcon, { backgroundColor: COLORS.dangerBg, borderColor: COLORS.dangerBorder }]}>
              <Ionicons name="heart-dislike" size={40} color={COLORS.danger} />
            </View>
            <Text style={styles.gateTitle}>{t('outOfHearts')}</Text>
            <Text style={styles.gateBody}>{t('outOfHeartsBody')}</Text>
            <EnergyBar hearts={0} maxHearts={maxHearts} size={26} />
            <TouchableOpacity onPress={() => { refillHearts(); setPhase('loading'); }} style={styles.adBtnWrap}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.adBtnGrad}>
                <Ionicons name="play-circle" size={22} color="#fff" />
                <Text style={styles.adBtnText}>{t('watchAdRefill')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.ghostBtn}>
              <Text style={styles.ghostBtnText}>{t('goBack')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === 'loading' || loadError) {
    return (
      <SafeAreaView style={styles.container}>
        <AmbientBg color={theme.color} />
        <View style={styles.centeredFull}>
          {loadError ? (
            <View style={styles.errorCard}>
              <Ionicons name="wifi-outline" size={52} color={COLORS.danger} />
              <Text style={styles.errorTitle}>{t('connectionError')}</Text>
              <Text style={styles.errorBody}>{t('connectionErrorBody')}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.retryText}>{t('goBack')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ActivityIndicator size="large" color={theme.color} />
              <Text style={styles.loadingText}>{t('loadingLevel')} {worldLevelNumber}…</Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'submitting') {
    return (
      <SafeAreaView style={styles.container}>
        <AmbientBg color={theme.color} />
        <View style={styles.centeredFull}>
          <ActivityIndicator size="large" color={theme.color} />
          <Text style={styles.loadingText}>{t('savingResults')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Living background */}
      <AmbientBg color={theme.color} />

      {/* World color accent at top */}
      <LinearGradient
        colors={[theme.dimColor + '66', 'transparent']}
        style={styles.topAccent}
        pointerEvents="none"
      />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel={t('exitGameLabel')}>
          <Ionicons name="close" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Progress dots */}
        <View style={styles.progressDots}>
          {questions.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressStep,
                {
                  backgroundColor: i < currentIndex
                    ? theme.color
                    : i === currentIndex
                    ? COLORS.textSecondary
                    : COLORS.surface3,
                  width: i === currentIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        <EnergyBar hearts={hearts} maxHearts={maxHearts} size={15} />
      </View>

      {/* ── Timer bar: thin strip with color ── */}
      <View style={styles.timerBarWrap}>
        <Animated.View
          style={[
            styles.timerBarFill,
            {
              width: timerBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              backgroundColor: timerBarColor,
            },
          ]}
        />
      </View>

      {/* ── Stats row ── */}
      <View style={styles.statsBar}>
        <ScoreDisplay score={score} color={theme.color} />
        <CircleTimer timeLeft={timeLeft} total={timerDuration} />
        <View style={styles.counterChip}>
          <Text style={styles.counterNum}>{currentIndex + 1}</Text>
          <Text style={styles.counterOf}>/{questions.length}</Text>
        </View>
      </View>

      {/* ── Streak badge ── */}
      {streak > 1 && (
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={14} color={COLORS.streak} />
          <Text style={styles.streakText}>{streak}x {t('winStreak')}!</Text>
        </View>
      )}

      {/* ── Question card ── */}
      <Animated.View
        style={[
          styles.questionCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            borderColor: theme.color + '44',
            shadowColor: theme.color,
            shadowOpacity: 0.18,
            shadowRadius: 16,
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'transparent']}
          style={styles.cardShine}
          pointerEvents="none"
        />
        <View style={styles.levelTag}>
          <Ionicons name={theme.icon as any} size={11} color={theme.color} />
          <Text style={[styles.levelTagText, { color: theme.color }]}>
            {theme.name} · Level {worldLevelNumber}
          </Text>
        </View>
        <Text style={styles.questionText}>{currentQuestion.text}</Text>
      </Animated.View>

      {/* ── Answer options ── */}
      <Animated.View style={[styles.options, { opacity: fadeAnim }]}>
        {currentQuestion.options.map((option, i) => {
          // Determine per-button state
          let btnState: 'idle' | 'selected' | 'correct' | 'wrong' = 'idle';
          if (phase === 'selected' && selectedIndex !== null) {
            btnState = i === selectedIndex ? 'selected' : 'idle';
          } else if (answerState !== 'idle') {
            if (i === currentQuestion.correctIndex) btnState = 'correct';
            else if (i === selectedIndex) btnState = 'wrong';
          }

          return (
            <OptionButton
              key={i}
              label={option}
              prefix={String.fromCharCode(65 + i)}
              answerState={btnState}
              disabled={phase !== 'playing'}
              onPress={() => handleAnswer(i)}
            />
          );
        })}
      </Animated.View>

      {/* ── Floating score popup ── */}
      {scorePopup && (
        <FloatingScore
          key={scorePopup.id}
          points={scorePopup.pts}
          streak={scorePopup.streak}
          x={W / 2}
          y={H * 0.27}
          onComplete={() => setScorePopup(null)}
        />
      )}

      {/* ── Fact reveal ── */}
      {phase === 'fact_reveal' && answerState !== 'idle' && (
        <FactReveal
          answerCorrect={answerState === 'correct'}
          timedOut={selectedIndex === null && answerState === 'wrong'}
          streak={streak}
          onContinue={handleContinue}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 180, zIndex: 0 },
  centeredFull: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingHorizontal: 24, zIndex: 1 },

  gateCard: {
    width: '100%', backgroundColor: COLORS.surface, borderRadius: 24, padding: 28,
    alignItems: 'center', gap: 16, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  gateIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  gateTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  gateBody: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 21 },
  adBtnWrap: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  adBtnGrad: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  adBtnText: { color: '#1E1B4B', fontSize: 16, fontWeight: '700' },
  ghostBtn: { paddingVertical: 12 },
  ghostBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '500' },

  errorCard: { alignItems: 'center', gap: 12, paddingHorizontal: 20 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  errorBody: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  retryBtn: { backgroundColor: COLORS.surface2, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border },
  retryText: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  loadingText: { color: COLORS.textMuted, fontSize: 15, marginTop: 10 },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingTop: 8, paddingBottom: 10, gap: 8, zIndex: 1,
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.surface2, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  progressDots: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, flexWrap: 'wrap',
  },
  progressStep: { height: 8, borderRadius: 4 },

  timerBarWrap: {
    height: 5, backgroundColor: COLORS.surface2, marginHorizontal: 14, borderRadius: 3,
    overflow: 'hidden', marginBottom: 10, zIndex: 1,
  },
  timerBarFill: { height: '100%', borderRadius: 3 },

  statsBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, marginBottom: 6, zIndex: 1,
  },
  counterChip: {
    flexDirection: 'row', alignItems: 'baseline',
    backgroundColor: COLORS.surface2, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  counterNum: { fontSize: 17, fontWeight: '900', color: COLORS.text },
  counterOf:  { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },

  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'center',
    backgroundColor: COLORS.streak + '20', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.streak, marginBottom: 8, zIndex: 1,
    shadowColor: COLORS.streak, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
  },
  streakText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, fontWeight: '800', color: COLORS.streak },

  questionCard: {
    marginHorizontal: 14, marginBottom: 14,
    backgroundColor: COLORS.surface, borderRadius: 24, padding: 22,
    minHeight: 138, justifyContent: 'center', borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.30, shadowRadius: 14, elevation: 6,
    overflow: 'hidden', zIndex: 1,
  },
  cardShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  levelTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  levelTagText: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  questionText: {
    fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 20, fontWeight: '700', color: COLORS.text,
    textAlign: 'center', lineHeight: 30, letterSpacing: -0.3,
  },

  options: { paddingHorizontal: 14, gap: 10, zIndex: 1 },
});
