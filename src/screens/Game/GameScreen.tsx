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
import { getLevelConfig, COLORS, WORLD_THEMES, WORLDS } from '../../constants';
import { fetchQuestionsForLevel, submitLevelAttempt } from '../../services/gameService';
import { useEnergy } from '../../hooks/useEnergy';
import { EnergyBar } from '../../components/EnergyBar';
import { OptionButton } from '../../components/game/OptionButton';
import { FactReveal } from '../../components/game/FactReveal';

type AnswerState = 'idle' | 'correct' | 'wrong';
type GamePhase = 'loading' | 'playing' | 'fact_reveal' | 'submitting' | 'no_energy';

type Props = RootStackScreenProps<'Game'>;

function getWorldTheme(worldId: number) {
  const world = WORLDS.find(w => w.worldId === worldId);
  return world ? WORLD_THEMES[world.key] : WORLD_THEMES.easy;
}

function getStars(accuracy: number): 0 | 1 | 2 | 3 {
  if (accuracy >= 1.0) return 3;
  if (accuracy >= 0.9) return 2;
  if (accuracy >= 0.75) return 1;
  return 0;
}

export const GameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { worldId, worldLevelNumber, levelNumber, categoryId } = route.params;
  const levelConfig = getLevelConfig(levelNumber);
  const theme = getWorldTheme(worldId);

  const { hearts, maxHearts, secondsUntilRegen, loseHeart, refillHearts } = useEnergy();

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
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const timerBarAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAnsweredRef = useRef(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex >= questions.length - 1;
  const timerDuration = levelConfig.timerSeconds;

  // Check energy on mount — show no-energy screen if empty
  useEffect(() => {
    if (hearts <= 0) {
      setPhase('no_energy');
      return;
    }

    setPhase('loading');
    setLoadError(null);
    let cancelled = false;
    fetchQuestionsForLevel(categoryId, {
      levelNumber,
      questionCount: levelConfig.questionCount,
      timerSeconds: levelConfig.timerSeconds,
      difficulty: levelNumber <= 20 ? 'easy' : levelNumber <= 40 ? 'medium' : 'hard',
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
          setPhase('loading');
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
      const stars = getStars(accuracy);

      navigation.replace('LevelCompletion', {
        worldId,
        worldLevelNumber,
        levelNumber,
        correct: finalCorrect,
        total,
        passed,
        accuracy,
        stars,
        nextLevel,
        energyRemaining: hearts,
      });
    },
    [questions.length, levelNumber, worldId, worldLevelNumber, hearts, navigation]
  );

  const advanceQuestion = useCallback(
    (latestCorrectCount: number) => {
      if (isLastQuestion) {
        finishGame(latestCorrectCount);
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
        setPhase('playing');
        isAnsweredRef.current = false;
        choiceScaleAnims.forEach(a => a.setValue(1));
        timerBarAnim.setValue(1);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    },
    [isLastQuestion, fadeAnim, timerBarAnim, choiceScaleAnims, finishGame, timerDuration, setPhase]
  );

  const handleContinue = useCallback(() => {
    advanceQuestion(correctCount);
  }, [advanceQuestion, correctCount]);

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
        loseHeart();
      }

      if (!timedOut && choiceIndex >= 0) {
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

      setPhase('fact_reveal');
    },
    [currentQuestion, streak, correctCount, stopTimer, choiceScaleAnims, loseHeart, setPhase]
  );

  // Timer per question
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
    outputRange: ['#ef4444', '#f97316', theme.color],
  });

  // No energy gate
  if (phase === 'no_energy') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredState}>
          <EnergyBar hearts={0} maxHearts={maxHearts} size={30} />
          <Text style={styles.noEnergyTitle}>Out of Hearts!</Text>
          <Text style={styles.noEnergyBody}>
            Watch an ad to refill your hearts and keep playing.
          </Text>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#7c3aed' }]}
            onPress={() => {
              // TODO: wire real rewarded ad (CHO-77 follow-up)
              refillHearts();
              setPhase('loading');
            }}
          >
            <Text style={styles.actionBtnText}>📺 Watch Ad to Refill</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Loading / error
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
              <ActivityIndicator size="large" color={theme.color} />
              <Text style={styles.loadingText}>Loading Level {worldLevelNumber}…</Text>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'submitting') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={theme.color} />
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
          <Text style={[styles.scoreValue, { color: theme.color }]}>{score}</Text>
        </View>
        <View style={styles.progressBox}>
          <Text style={styles.progressText}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>
        <View style={styles.heartsBox}>
          <EnergyBar hearts={hearts} maxHearts={maxHearts} size={16} />
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
      <Animated.View style={[styles.questionCard, { opacity: fadeAnim, borderColor: theme.color }]}>
        <Text style={styles.questionText}>{currentQuestion.text}</Text>
      </Animated.View>

      {/* Choices — Duolingo-style OptionButton (§5.2) */}
      <Animated.View style={[styles.choicesContainer, { opacity: fadeAnim }]}>
        {currentQuestion.options.map((option, index) => {
          let state: 'idle' | 'correct' | 'wrong' = 'idle';
          if (answerState !== 'idle') {
            if (index === currentQuestion.correctIndex) state = 'correct';
            else if (index === selectedIndex) state = 'wrong';
          }
          return (
            <OptionButton
              key={index}
              label={option}
              prefix={String.fromCharCode(65 + index)}
              answerState={state}
              disabled={answerState !== 'idle'}
              onPress={() => handleAnswer(index)}
            />
          );
        })}
      </Animated.View>

      {/* Duolingo slide-up feedback banner (§6.3) */}
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
    paddingHorizontal: 24,
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
  noEnergyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  noEnergyBody: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    paddingVertical: 12,
  },
  backBtnText: {
    color: COLORS.textMuted,
    fontSize: 15,
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
  heartsBox: {
    alignItems: 'flex-end',
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
    borderWidth: 1,
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
