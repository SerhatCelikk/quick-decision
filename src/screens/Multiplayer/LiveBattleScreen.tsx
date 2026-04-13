import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

type Props = RootStackScreenProps<'LiveBattle'>;

interface BattleQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface BattleState {
  questions: BattleQuestion[];
  currentIndex: number;
  myScore: number;
  opponentScore: number;
  answered: boolean;
  selectedIndex: number | null;
  timeLeft: number;
}

const BATTLE_QUESTION_COUNT = 10;
const QUESTION_TIME = 8;

// Placeholder battle questions for offline/demo mode
const DEMO_QUESTIONS: BattleQuestion[] = Array.from({ length: BATTLE_QUESTION_COUNT }, (_, i) => ({
  id: String(i),
  text: `Battle Question ${i + 1}: Which of the following is correct?`,
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctIndex: Math.floor(Math.random() * 4),
}));

export const LiveBattleScreen: React.FC<Props> = ({ route, navigation }) => {
  const { matchId, opponentUsername } = route.params;
  const { t } = useI18n();
  const timerAnim = useRef(new Animated.Value(1)).current;

  const [state, setState] = useState<BattleState>({
    questions: DEMO_QUESTIONS,
    currentIndex: 0,
    myScore: 0,
    opponentScore: 0,
    answered: false,
    selectedIndex: null,
    timeLeft: QUESTION_TIME,
  });

  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Load real questions from Supabase for the match
    (async () => {
      try {
        const { data } = await supabase
          .from('battle_questions')
          .select('id, text, options, correct_index')
          .eq('match_id', matchId)
          .limit(BATTLE_QUESTION_COUNT);

        if (data && data.length > 0) {
          setState((prev) => ({
            ...prev,
            questions: data.map((q: { id: string; text: string; options: string[]; correct_index: number }) => ({
              id: q.id,
              text: q.text,
              options: q.options,
              correctIndex: q.correct_index,
            })),
          }));
        }
      } catch {
        // Use demo questions as fallback
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId]);

  // Subscribe to opponent score updates
  useEffect(() => {
    const channel = supabase.channel(`battle:${matchId}`)
      .on('broadcast', { event: 'score_update' }, (payload) => {
        const { user_id, score } = payload.payload as { user_id: string; score: number };
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user && user_id !== user.id) {
            setState((prev) => ({ ...prev, opponentScore: score }));
          }
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  // Timer
  const startTimer = () => {
    timerAnim.setValue(1);
    Animated.timing(timerAnim, {
      toValue: 0,
      duration: QUESTION_TIME * 1000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.timeLeft <= 1 || prev.answered) {
          clearInterval(timerRef.current!);
          if (!prev.answered) {
            setTimeout(() => advanceQuestion(), 500);
          }
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  useEffect(() => {
    if (!loading) startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading, state.currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const advanceQuestion = () => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.questions.length) {
        // Battle over
        navigation.replace('BattleResults', {
          matchId,
          won: prev.myScore > prev.opponentScore,
          myScore: prev.myScore,
          opponentScore: prev.opponentScore,
          opponentUsername,
        });
        return prev;
      }
      return {
        ...prev,
        currentIndex: nextIndex,
        answered: false,
        selectedIndex: null,
        timeLeft: QUESTION_TIME,
      };
    });
  };

  const handleAnswer = async (index: number) => {
    if (state.answered) return;
    const question = state.questions[state.currentIndex];
    const isCorrect = index === question.correctIndex;
    const newScore = state.myScore + (isCorrect ? 100 : 0);

    setState((prev) => ({ ...prev, answered: true, selectedIndex: index, myScore: newScore }));

    // Broadcast score to opponent
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      supabase.channel(`battle:${matchId}`).send({
        type: 'broadcast',
        event: 'score_update',
        payload: { user_id: user.id, score: newScore },
      });
    }

    setTimeout(() => advanceQuestion(), 1000);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>{t('battleReady')}</Text>
      </SafeAreaView>
    );
  }

  const question = state.questions[state.currentIndex];
  if (!question) return null;

  const timerWidth = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Score bar */}
      <View style={styles.scoreBanner}>
        <View style={styles.scoreBlock}>
          <Text style={[styles.scoreValue, { color: COLORS.primary }]}>{state.myScore}</Text>
          <Text style={styles.scoreLabel}>{t('yourScore')}</Text>
        </View>
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.scoreBlock}>
          <Text style={[styles.scoreValue, { color: COLORS.danger }]}>{state.opponentScore}</Text>
          <Text style={styles.scoreLabel}>{opponentUsername}</Text>
        </View>
      </View>

      {/* Timer bar */}
      <View style={styles.timerBg}>
        <Animated.View style={[styles.timerFill, { width: timerWidth as unknown as number }]} />
      </View>
      <Text style={styles.timerText}>{state.timeLeft}s</Text>

      {/* Question */}
      <View style={styles.questionCard}>
        <Text style={styles.questionCount}>
          {state.currentIndex + 1} / {state.questions.length}
        </Text>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {question.options.map((opt, i) => {
          let bg: string = COLORS.surface;
          let borderColor: string = COLORS.border;
          if (state.answered) {
            if (i === question.correctIndex) { bg = '#052e16'; borderColor = '#22c55e'; }
            else if (i === state.selectedIndex) { bg = '#450a0a'; borderColor = '#ef4444'; }
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.optionButton, { backgroundColor: bg, borderColor }]}
              onPress={() => handleAnswer(i)}
              disabled={state.answered}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20 },
  loadingText: { textAlign: 'center', color: COLORS.text, fontSize: 22, fontWeight: 'bold', marginTop: 100 },
  scoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  scoreBlock: { alignItems: 'center', flex: 1 },
  scoreValue: { fontSize: 30, fontWeight: 'bold' },
  scoreLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  vsText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMuted },
  timerBg: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  timerFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  timerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  questionCount: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  questionText: { fontSize: 17, fontWeight: '600', color: COLORS.text, lineHeight: 26 },
  options: { gap: 10 },
  optionButton: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 2,
  },
  optionText: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
});
