import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import type { Question } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TIMER_DURATION = 10; // seconds
const POINTS_PER_CORRECT = 100;
const STREAK_BONUS_MULTIPLIER = 0.5; // +50% per streak level

// Mock questions — replace with Supabase fetch once CHO-19 is complete
const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    text: 'Which planet is closest to the Sun?',
    options: ['Mercury', 'Venus'],
    correctIndex: 0,
    categoryId: 'general',
    difficulty: 'easy',
  },
  {
    id: '2',
    text: 'How many sides does a hexagon have?',
    options: ['5', '6'],
    correctIndex: 1,
    categoryId: 'general',
    difficulty: 'easy',
  },
  {
    id: '3',
    text: 'What is the chemical symbol for Gold?',
    options: ['Au', 'Ag'],
    correctIndex: 0,
    categoryId: 'general',
    difficulty: 'medium',
  },
  {
    id: '4',
    text: 'Who painted the Mona Lisa?',
    options: ['Michelangelo', 'Leonardo da Vinci'],
    correctIndex: 1,
    categoryId: 'general',
    difficulty: 'easy',
  },
  {
    id: '5',
    text: 'Is the Great Wall of China visible from space?',
    options: ['Yes', 'No'],
    correctIndex: 1,
    categoryId: 'general',
    difficulty: 'medium',
  },
  {
    id: '6',
    text: 'Which is the largest ocean on Earth?',
    options: ['Pacific', 'Atlantic'],
    correctIndex: 0,
    categoryId: 'general',
    difficulty: 'easy',
  },
  {
    id: '7',
    text: 'Does sound travel faster in water than in air?',
    options: ['Yes', 'No'],
    correctIndex: 0,
    categoryId: 'general',
    difficulty: 'medium',
  },
  {
    id: '8',
    text: 'What is the hardest natural substance on Earth?',
    options: ['Diamond', 'Quartz'],
    correctIndex: 0,
    categoryId: 'general',
    difficulty: 'easy',
  },
];

type AnswerState = 'idle' | 'correct' | 'wrong';
type GamePhase = 'playing' | 'finished';

type Props = RootStackScreenProps<'Game'>;

export const GameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryId } = route.params;

  const questions = MOCK_QUESTIONS.filter(q => q.categoryId === categoryId || categoryId === 'general');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<GamePhase>('playing');

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

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (timerBarAnimRef.current) {
      timerBarAnimRef.current.stop();
    }
  }, []);

  const advanceQuestion = useCallback(() => {
    if (isLastQuestion) {
      setTimeout(() => setPhase('finished'), 800);
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(TIMER_DURATION);
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
  }, [isLastQuestion, fadeAnim, timerBarAnim, choiceScaleAnims]);

  const handleAnswer = useCallback(
    (choiceIndex: number, timedOut: boolean = false) => {
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

      // Animate chosen button
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

      setTimeout(advanceQuestion, 900);
    },
    [currentQuestion, streak, stopTimer, advanceQuestion, choiceScaleAnims]
  );

  // Start countdown timer
  useEffect(() => {
    if (phase !== 'playing') return;

    isAnsweredRef.current = false;
    setTimeLeft(TIMER_DURATION);
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
      duration: TIMER_DURATION * 1000,
      useNativeDriver: false,
    });
    timerBarAnimRef.current.start();

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (timerBarAnimRef.current) timerBarAnimRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, phase]);

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

  if (phase === 'finished') {
    const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.finishedCard, { opacity: fadeAnim }]}>
          <Text style={styles.finishedTitle}>Game Over!</Text>
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
          <TouchableOpacity style={styles.playAgainButton} onPress={() => navigation.goBack()}>
            <Text style={styles.playAgainText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
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
              : selectedIndex === null ? '⏱ Time\'s up!' : '✗ Wrong'}
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
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  progressBox: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  streakBox: {
    alignItems: 'center',
  },
  streakLabel: {
    fontSize: 12,
    color: '#94a3b8',
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
    backgroundColor: '#1e293b',
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
    color: '#94a3b8',
    marginBottom: 28,
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
    backgroundColor: '#1e293b',
    borderColor: '#334155',
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
    backgroundColor: '#334155',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginRight: 14,
    overflow: 'hidden',
  },
  choiceText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: '#f8fafc',
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
  // Finished screen
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
    marginBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 48,
    width: '100%',
  },
  statItem: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 20,
    width: (SCREEN_WIDTH - 80) / 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playAgainButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  playAgainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
