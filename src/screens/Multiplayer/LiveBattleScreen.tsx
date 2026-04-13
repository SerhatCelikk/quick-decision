import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../../types';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

type Props = RootStackScreenProps<'LiveBattle'>;

interface BattleQuestion {
  id: string; text: string; options: string[]; correctIndex: number;
}
interface BattleState {
  questions: BattleQuestion[]; currentIndex: number;
  myScore: number; opponentScore: number;
  answered: boolean; selectedIndex: number | null; timeLeft: number;
}

const BATTLE_QUESTION_COUNT = 10;
const QUESTION_TIME = 8;

const DEMO_QUESTIONS: BattleQuestion[] = Array.from({ length: BATTLE_QUESTION_COUNT }, (_, i) => ({
  id: String(i),
  text: `Battle Question ${i + 1}: Which of the following is correct?`,
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctIndex: Math.floor(Math.random() * 4),
}));

// Option letter prefix colors — consistent with OptionButton
const PREFIX_COLORS = ['#2979FF', '#FF6D00', '#C84DFF', '#00C060'];

export const LiveBattleScreen: React.FC<Props> = ({ route, navigation }) => {
  const { matchId, opponentUsername } = route.params;
  const { t } = useI18n();
  const timerAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<BattleState>({
    questions: DEMO_QUESTIONS, currentIndex: 0,
    myScore: 0, opponentScore: 0,
    answered: false, selectedIndex: null, timeLeft: QUESTION_TIME,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('battle_questions').select('id, text, options, correct_index')
          .eq('match_id', matchId).limit(BATTLE_QUESTION_COUNT);
        if (data && data.length > 0) {
          setState((prev) => ({
            ...prev,
            questions: data.map((q: any) => ({
              id: q.id, text: q.text, options: q.options, correctIndex: q.correct_index,
            })),
          }));
        }
      } catch { /* use demo questions */ } finally { setLoading(false); }
    })();
  }, [matchId]);

  useEffect(() => {
    const channel = supabase.channel(`battle:${matchId}`)
      .on('broadcast', { event: 'score_update' }, (payload) => {
        const { user_id, score } = payload.payload as { user_id: string; score: number };
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user && user_id !== user.id) setState((prev) => ({ ...prev, opponentScore: score }));
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  const advanceQuestion = () => {
    setState((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.questions.length) {
        navigation.replace('BattleResults', {
          matchId, won: prev.myScore > prev.opponentScore,
          myScore: prev.myScore, opponentScore: prev.opponentScore, opponentUsername,
        });
        return prev;
      }
      return { ...prev, currentIndex: nextIndex, answered: false, selectedIndex: null, timeLeft: QUESTION_TIME };
    });
  };

  const startTimer = () => {
    timerAnim.setValue(1);
    Animated.timing(timerAnim, { toValue: 0, duration: QUESTION_TIME * 1000, useNativeDriver: false }).start();
    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.timeLeft <= 1 || prev.answered) {
          clearInterval(timerRef.current!);
          if (!prev.answered) setTimeout(() => advanceQuestion(), 500);
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

  const handleAnswer = async (index: number) => {
    if (state.answered) return;
    const question = state.questions[state.currentIndex];
    const isCorrect = index === question.correctIndex;
    const newScore = state.myScore + (isCorrect ? 100 : 0);
    setState((prev) => ({ ...prev, answered: true, selectedIndex: index, myScore: newScore }));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      supabase.channel(`battle:${matchId}`).send({
        type: 'broadcast', event: 'score_update', payload: { user_id: user.id, score: newScore },
      });
    }
    setTimeout(() => advanceQuestion(), 1000);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <Ionicons name="flash" size={36} color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('battleReady')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const question = state.questions[state.currentIndex];
  if (!question) return null;

  // Timer color based on time remaining
  const timePct = state.timeLeft / QUESTION_TIME;
  const timerColor = timePct > 0.5 ? COLORS.timerSafe : timePct > 0.25 ? COLORS.timerWarning : COLORS.timerDanger;
  const timerWidth = timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.container}>

      {/* Score banner */}
      <View style={styles.scoreBanner}>
        <View style={styles.scoreBlock}>
          <Text style={[styles.scoreValue, { color: COLORS.primary }]}>{state.myScore}</Text>
          <Text style={styles.scoreLabel}>{t('yourScore')}</Text>
        </View>
        <View style={styles.vsDividerWrap}>
          <LinearGradient colors={[COLORS.primary + '44', COLORS.danger + '44']} style={styles.vsGrad}>
            <Text style={styles.vsText}>VS</Text>
          </LinearGradient>
        </View>
        <View style={styles.scoreBlock}>
          <Text style={[styles.scoreValue, { color: COLORS.danger }]}>{state.opponentScore}</Text>
          <Text style={styles.scoreLabel}>{opponentUsername}</Text>
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerRow}>
        <View style={styles.timerBg}>
          <Animated.View style={[styles.timerFill, { width: timerWidth as unknown as number, backgroundColor: timerColor }]} />
        </View>
        <View style={[styles.timerBadge, { borderColor: timerColor + '88' }]}>
          <Text style={[styles.timerText, { color: timerColor }]}>{state.timeLeft}s</Text>
        </View>
      </View>

      {/* Progress */}
      <Text style={styles.questionCount}>
        {state.currentIndex + 1} / {state.questions.length}
      </Text>

      {/* Question card */}
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {question.options.map((opt, i) => {
          let bg: string = COLORS.surface;
          let borderColor: string = COLORS.border;
          let textColor: string = COLORS.text;
          if (state.answered) {
            if (i === question.correctIndex) { bg = '#001F0A'; borderColor = COLORS.success; textColor = COLORS.success; }
            else if (i === state.selectedIndex) { bg = '#1F0008'; borderColor = COLORS.danger; textColor = COLORS.danger; }
          }
          const letters = ['A', 'B', 'C', 'D'];
          return (
            <TouchableOpacity
              key={i}
              style={[styles.optionButton, { backgroundColor: bg, borderColor }]}
              onPress={() => handleAnswer(i)}
              disabled={state.answered}
              activeOpacity={0.85}
            >
              <View style={[styles.optionPrefix, { backgroundColor: PREFIX_COLORS[i] + '30', borderColor: PREFIX_COLORS[i] + '66' }]}>
                <Text style={[styles.optionPrefixText, { color: PREFIX_COLORS[i] }]}>{letters[i]}</Text>
              </View>
              <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
              {state.answered && i === question.correctIndex && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              )}
              {state.answered && i === state.selectedIndex && i !== question.correctIndex && (
                <Ionicons name="close-circle" size={20} color={COLORS.danger} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 16 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { textAlign: 'center', color: COLORS.text, fontSize: 20, fontWeight: '800' },

  scoreBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 18,
    padding: 16, marginTop: 12, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  scoreBlock: { flex: 1, alignItems: 'center' },
  scoreValue: { fontSize: 30, fontWeight: '900' },
  scoreLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' },
  vsDividerWrap: { paddingHorizontal: 8 },
  vsGrad: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  vsText: { fontSize: 13, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },

  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  timerBg: { flex: 1, height: 8, backgroundColor: COLORS.surface2, borderRadius: 4, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 4 },
  timerBadge: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  timerText: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },

  questionCount: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  questionCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  questionText: { fontSize: 17, fontWeight: '700', color: COLORS.text, lineHeight: 26 },

  options: { gap: 10 },
  optionButton: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14, borderWidth: 1.5,
  },
  optionPrefix: {
    width: 32, height: 32, borderRadius: 8, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  optionPrefixText: { fontSize: 14, fontWeight: '900' },
  optionText: { flex: 1, fontSize: 15, fontWeight: '600' },
});
