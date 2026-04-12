import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import type { Question } from '../../types';
import {
  fetchQuestionsForLevel,
  fetchUserProgress,
  fetchLevelConfig,
  submitScore,
  submitLevelAttempt,
  type LevelConfig,
  type LevelAttemptResult,
} from '../../services/gameService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POINTS_PER_CORRECT = 100;
const STREAK_BONUS_MULTIPLIER = 0.5;

type AnswerState = 'idle' | 'correct' | 'wrong';
type GamePhase = 'loading' | 'error' | 'playing' | 'finished';

type Props = RootStackScreenProps<'Game'>;

export const GameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryId } = route.params;

  // ─── Setup state ─────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [levelConfig, setLevelConfig] = useState<LevelConfig | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ─── Game state ───────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // ─── Post-game state ──────────────────────────────────────────────────────
  const [attemptResult, setAttemptResult] = useState<LevelAttemptResult | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerBarAnim = useRef(new Animated.Value(1)).current;
  const choiceScaleAnims = useRef([new Animated.Value(1), new Animated.Value(1)]).current;

  const timerBarAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAnsweredRef = useRef(false);

  // ─── Load questions on mount ─────────────────────────────────────────────
  const loadGame = useCallback(async () => {
    setPhase('loading');
    setLoadError(null);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setAnswerState('idle');
    setSelectedIndex(null);
    setAttemptResult(null);
    isAnsweredRef.current = false;

    try {
      // Fetch user progress and level config in parallel
      const [progress] = await Promise.all([fetchUserProgress()]);
      const levelNumber = progress?.current_level ?? 1;
      const config = await fetchLevelConfig(levelNumber);
      setLevelConfig(config);
      setTimeLeft(config.timerSeconds);

      const qs = await fetchQuestionsForLevel(categoryId, config);
      setQuestions(qs);
      setPhase('playing');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load questions';
      setLoadError(msg);
      setPhase('error');
    }
  }, [categoryId]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const timerDuration = levelConfig?.timerSeconds ?? 10;
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex >= questions.length - 1;

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    timerBarAnimRef.current?.stop();
  }, []);

  const advanceQuestion = useCallback(() => {
    if (isLastQuestion) {
      setTimeout(() => setPhase('finished'), 800);
      return;
    }

    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(timerDuration);
      setAnswerState('idle');
      setSelectedIndex(null);
      isAnsweredRef.current = false;
      choiceScaleAnims[0].setValue(1);
      choiceScaleAnims[1].setValue(1);
      timerBarAnim.setValue(1);

      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }, [isLastQuestion, fadeAnim, timerBarAnim, choiceScaleAnims, timerDuration]);

  const handleAnswer = useCallback(
    (choiceIndex: number, timedOut = false) => {
      if (isAnsweredRef.current) return;
      isAnsweredRef.current = true;
      stopTimer();

      const isCorrect = !timedOut && choiceIndex === currentQuestion.correctIndex;

      setSelectedIndex(timedOut ? null : choiceIndex);
      setAnswerState(isCorrect ? 'correct' : 'wrong');

      if (isCorrect) {
        const newStreak = streak + 1;
        const bonus = Math.floor(POINTS_PER_CORRECT * (1 + (newStreak - 1) * STREAK_BONUS_MULTIPLIER));
        setScore(prev => prev + bonus);
        setStreak(newStreak);
        setMaxStreak(prev => Math.max(prev, newStreak));
        setCorrectCount(prev => prev + 1);
      } else {
        setStreak(0);
      }

      if (!timedOut) {
        Animated.sequence([
          Animated.timing(choiceScaleAnims[choiceIndex], { toValue: 0.94, duration: 80, useNativeDriver: true }),
          Animated.timing(choiceScaleAnims[choiceIndex], { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
      }

      setTimeout(advanceQuestion, 900);
    },
    [currentQuestion, streak, stopTimer, advanceQuestion, choiceScaleAnims]
  );

  // ─── Timer per question ───────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;

    isAnsweredRef.current = false;
    setTimeLeft(timerDuration);
    timerBarAnim.setValue(1);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          handleAnswer(-1, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerBarAnimRef.current = Animated.timing(timerBarAnim, {
      toValue: 0,
      duration: timerDuration * 1000,
      useNativeDriver: false,
    });
    timerBarAnimRef.current.start();

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerBarAnimRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, phase]);

  // ─── Submit results when finished ────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'finished' || !levelConfig) return;

    const total = questions.length;
    const correct = correctCount;

    // Non-blocking submissions
    submitScore({
      score,
      streak: maxStreak,
      categoryId: categoryId === 'general' ? null : categoryId,
      questionsAnswered: total,
      questionsCorrect: correct,
    }).catch(() => null);

    submitLevelAttempt({
      levelNumber: levelConfig.levelNumber,
      questionsCorrect: correct,
      questionsTotal: total,
    })
      .then(result => setAttemptResult(result))
      .catch(() => null);
  // Only trigger once when phase changes to finished
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ─── Styles helpers ───────────────────────────────────────────────────────
  const getChoiceStyle = (index: number) => {
    if (answerState === 'idle') return styles.choiceDefault;
    const isCorrect = index === currentQuestion?.correctIndex;
    const isSelected = index === selectedIndex;
    if (isCorrect) return styles.choiceCorrect;
    if (isSelected && !isCorrect) return styles.choiceWrong;
    return styles.choiceDefault;
  };

  const timerColor = timerBarAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: ['#ef4444', '#f97316', '#22c55e'],
  });

  // ─── Render: loading ─────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading questions…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: error ────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Couldn't load questions</Text>
          <Text style={styles.errorBody}>{loadError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadGame}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render: finished ────────────────────────────────────────────────────
  if (phase === 'finished') {
    const accuracy = questions.length > 0
      ? Math.round((correctCount / questions.length) * 100)
      : 0;

    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.finishedCard, { opacity: fadeAnim }]}>
          <Text style={styles.finishedTitle}>Game Over!</Text>

          {attemptResult && (
            <View style={[
              styles.levelResultBanner,
              attemptResult.passed ? styles.levelPassed : styles.levelFailed,
            ]}>
              <Text style={styles.levelResultText}>
                {attemptResult.passed
                  ? `Level ${levelConfig?.levelNumber} cleared! → Level ${attemptResult.next_level}`
                  : `Level ${levelConfig?.levelNumber} not passed (${Math.round(attemptResult.accuracy * 100)}% — need 75%)`}
              </Text>
            </View>
          )}

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{score}</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{correctCount}/{questions.length}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{maxStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.playAgainButton} onPress={loadGame}>
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ─── Render: playing ──────────────────────────────────────────────────────
  if (!currentQuestion) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.progressBox}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>
        <View style={styles.streakBox}>
          <Text style={styles.streakLabel}>Streak</Text>
          <Text style={styles.streakValue}>{streak > 0 ? `🔥 ${streak}` : '—'}</Text>
        </View>
      </View>

      {/* Timer bar */}
      <View style={styles.timerTrack}>
        <Animated.View
          style={[
            styles.timerBar,
            {
              width: timerBarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              backgroundColor: timerColor,
            },
          ]}
        />
      </View>
      <Text style={styles.timerText}>{timeLeft}s</Text>

      {/* Question */}
      <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
        {levelConfig && (
          <Text style={styles.levelBadge}>Level {levelConfig.levelNumber}</Text>
        )}
        <Text style={styles.questionText}>{currentQuestion.text}</Text>
      </Animated.View>

      {/* Choices */}
      <Animated.View style={[styles.choicesContainer, { opacity: fadeAnim }]}>
        {currentQuestion.options.map((option, index) => (
          <Animated.View
            key={index}
            style={{ transform: [{ scale: choiceScaleAnims[index] }], width: '100%' }}
          >
            <TouchableOpacity
              style={[styles.choiceButton, getChoiceStyle(index)]}
              onPress={() => handleAnswer(index)}
              disabled={answerState !== 'idle'}
              activeOpacity={0.85}
            >
              <Text style={styles.choiceLabel}>{index === 0 ? 'A' : 'B'}</Text>
              <Text style={styles.choiceText}>{option}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Feedback banner */}
      {answerState !== 'idle' && (
        <View style={[
          styles.feedbackBanner,
          answerState === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
        ]}>
          <Text style={styles.feedbackText}>
            {answerState === 'correct'
              ? streak > 1 ? `🔥 Streak x${streak}!` : '✓ Correct!'
              : selectedIndex === null ? "⏱ Time's up!" : '✗ Wrong'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 12,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorBody: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    color: '#64748b',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  scoreBox: { alignItems: 'center' },
  scoreLabel: { fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreValue: { fontSize: 22, fontWeight: 'bold', color: '#f8fafc' },
  progressBox: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressText: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  streakBox: { alignItems: 'center' },
  streakLabel: { fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  streakValue: { fontSize: 18, fontWeight: 'bold', color: '#f97316' },
  timerTrack: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  timerBar: { height: '100%', borderRadius: 3 },
  timerText: { textAlign: 'center', fontSize: 13, color: '#94a3b8', marginBottom: 28 },
  levelBadge: {
    fontSize: 11,
    color: '#6366f1',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 28,
    marginBottom: 32,
    minHeight: 140,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#f8fafc',
    textAlign: 'center',
    lineHeight: 32,
  },
  choicesContainer: { gap: 14, alignItems: 'center' },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
  },
  choiceDefault: { backgroundColor: '#1e293b', borderColor: '#334155' },
  choiceCorrect: { backgroundColor: '#14532d', borderColor: '#22c55e' },
  choiceWrong: { backgroundColor: '#450a0a', borderColor: '#ef4444' },
  choiceLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginRight: 14,
    overflow: 'hidden',
  },
  choiceText: { flex: 1, fontSize: 17, fontWeight: '500', color: '#f8fafc' },
  feedbackBanner: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  feedbackCorrect: { backgroundColor: '#15803d' },
  feedbackWrong: { backgroundColor: '#b91c1c' },
  feedbackText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  // Finished
  finishedCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  finishedTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 20,
  },
  levelResultBanner: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  levelPassed: { backgroundColor: '#14532d' },
  levelFailed: { backgroundColor: '#450a0a' },
  levelResultText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 32,
    width: '100%',
  },
  statItem: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 20,
    width: (SCREEN_WIDTH - 80) / 2,
    alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#6366f1', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  playAgainButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  playAgainText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  doneButton: {
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  doneText: { color: '#64748b', fontSize: 16 },
});
