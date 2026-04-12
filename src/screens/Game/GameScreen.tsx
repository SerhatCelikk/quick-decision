import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import type { Question } from '../../types';
import { getLevelConfig, COLORS } from '../../constants';
import { fetchQuestionsForLevel, submitLevelAttempt } from '../../services/gameService';

type AnswerState = 'idle' | 'correct' | 'wrong';
type GamePhase = 'loading' | 'playing' | 'submitting';

type Props = RootStackScreenProps<'Game'>;

export const GameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryId, levelNumber = 1 } = route.params;
  const levelConfig = getLevelConfig(levelNumber);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(levelConfig.timerSeconds);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerBarAnim = useRef(new Animated.Value(1)).current;
  const choiceScaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const timerBarAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAnsweredRef = useRef(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex >= questions.length - 1;
  const timerDuration = levelConfig.timerSeconds;

  // Load questions on mount
  useEffect(() => {
    let cancelled = false;
    setPhase('loading');
    setLoadError(null);
    fetchQuestionsForLevel(categoryId, {
      levelNumber,
      questionCount: levelConfig.questionCount,
      timerSeconds: levelConfig.timerSeconds,
      difficulty: levelNumber <= 5 ? 'easy' : levelNumber <= 10 ? 'medium' : 'hard',
    })
      .then(qs => {
        if (!cancelled) {
          setQuestions(qs);
          setPhase('playing');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Failed to load questions. Check your connection and try again.');
        }
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (timerBarAnimRef.current) {
      timerBarAnimRef.current.stop();
    }
  }, []);

  const finishGame = useCallback(
    async (finalCorrect: number) => {
      setPhase('submitting');
      const total = questions.length;

      const result = await submitLevelAttempt({
        levelNumber,
        questionsCorrect: finalCorrect,
        questionsTotal: total,
      });

      const accuracy = total > 0 ? finalCorrect / total : 0;
      const passed = accuracy >= 0.75;
      const nextLevel = result?.next_level ?? (passed ? levelNumber + 1 : levelNumber);

      navigation.replace('LevelCompletion', {
        levelNumber,
        correct: finalCorrect,
        total,
        passed,
        accuracy,
        nextLevel,
      });
    },
    [questions.length, levelNumber, navigation]
  );

  const advanceQuestion = useCallback(
    (latestCorrectCount: number) => {
      if (isLastQuestion) {
        setTimeout(() => finishGame(latestCorrectCount), 800);
        return;
      }

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(prev => prev + 1);
        setTimeLeft(timerDuration);
        setAnswerState('idle');
        setSelectedIndex(null);
        isAnsweredRef.current = false;
        choiceScaleAnims[0].setValue(1);
        choiceScaleAnims[1].setValue(1);
        timerBarAnim.setValue(1);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    },
    [isLastQuestion, fadeAnim, timerBarAnim, choiceScaleAnims, finishGame, timerDuration]
  );

  const handleAnswer = useCallback(
    (choiceIndex: number, timedOut: boolean = false) => {
      if (isAnsweredRef.current) return;
      isAnsweredRef.current = true;
      stopTimer();

      const isCorrect = !timedOut && choiceIndex === currentQuestion.correctIndex;

      setSelectedIndex(timedOut ? null : choiceIndex);
      setAnswerState(isCorrect ? 'correct' : 'wrong');

      let newCorrectCount = correctCount;
      if (isCorrect) {
        const newStreak = streak + 1;
        setScore(prev => prev + Math.floor(100 * (1 + (newStreak - 1) * 0.5)));
        setStreak(newStreak);
        newCorrectCount = correctCount + 1;
        setCorrectCount(newCorrectCount);
      } else {
        setStreak(0);
      }

      if (!timedOut) {
        Animated.sequence([
          Animated.timing(choiceScaleAnims[choiceIndex], {
            toValue: 0.94,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(choiceScaleAnims[choiceIndex], {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
        ]).start();
      }

      setTimeout(() => advanceQuestion(newCorrectCount), 900);
    },
    [currentQuestion, streak, correctCount, stopTimer, advanceQuestion, choiceScaleAnims]
  );

  // Timer effect
  useEffect(() => {
    if (phase !== 'playing' || questions.length === 0) return;

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
      if (timerBarAnimRef.current) timerBarAnimRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, phase, questions.length]);

  const getChoiceStyle = (index: number) => {
    if (answerState === 'idle') return styles.choiceDefault;
    const isCorrect = index === currentQuestion.correctIndex;
    const isSelected = index === selectedIndex;
    if (isCorrect) return styles.choiceCorrect;
    if (isSelected && !isCorrect) return styles.choiceWrong;
    return styles.choiceDefault;
  };

  const timerColor = timerBarAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: ['#ef4444', '#f97316', '#22c55e'],
  });

  // Loading / error state
  if (phase === 'loading' || loadError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredState}>
          {loadError ? (
            <>
              <Text style={styles.errorText}>{loadError}</Text>
              <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
                <Text style={styles.goBackButtonText}>Go Back</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading Level {levelNumber}…</Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Submitting state
  if (phase === 'submitting') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Saving results…</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              width: timerBarAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: timerColor,
            },
          ]}
        />
      </View>
      <Text style={styles.timerText}>{timeLeft}s</Text>

      {/* Question */}
      <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
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
        <View style={[styles.feedbackBanner, answerState === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong]}>
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
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  goBackButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
  },
  goBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  scoreBox: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressBox: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  streakBox: {
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f97316',
  },
  timerTrack: {
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  timerBar: {
    height: '100%',
    borderRadius: 3,
  },
  timerText: {
    textAlign: 'center',
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 28,
  },
  questionCard: {
    backgroundColor: COLORS.surface,
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
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  choicesContainer: {
    gap: 14,
    alignItems: 'center',
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
  },
  choiceDefault: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  choiceCorrect: {
    backgroundColor: '#14532d',
    borderColor: '#22c55e',
  },
  choiceWrong: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
  },
  choiceLabel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginRight: 14,
    overflow: 'hidden',
  },
  choiceText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.text,
  },
  feedbackBanner: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#15803d',
  },
  feedbackWrong: {
    backgroundColor: '#b91c1c',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
