import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackScreenProps } from '../../types';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

type Props = RootStackScreenProps<'SeasonalEvent'>;

interface Milestone {
  questionsRequired: number;
  reward: string;
  completed: boolean;
}

const SPRING_MILESTONES: Milestone[] = [
  { questionsRequired: 5,  reward: '🌱 Seedling Badge',    completed: false },
  { questionsRequired: 15, reward: '🌸 Blossom Badge',     completed: false },
  { questionsRequired: 30, reward: '🌿 Spring Scholar Badge', completed: false },
];

interface EventProgress {
  questionsAnswered: number;
  correctAnswers: number;
  rank: number | null;
}

export const SeasonalEventScreen: React.FC<Props> = ({ route }) => {
  const { eventTitle } = route.params;
  const { t } = useI18n();
  const [progress, setProgress] = useState<EventProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('seasonal_event_progress')
          .select('questions_answered, correct_answers')
          .eq('user_id', user.id)
          .eq('event_key', 'spring_2026')
          .single();

        setProgress({
          questionsAnswered: data?.questions_answered ?? 0,
          correctAnswers: data?.correct_answers ?? 0,
          rank: null,
        });
      } else {
        setProgress({ questionsAnswered: 0, correctAnswers: 0, rank: null });
      }
    } catch {
      // Table may not exist yet — show zero progress
      setProgress({ questionsAnswered: 0, correctAnswers: 0, rank: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const answered = progress?.questionsAnswered ?? 0;
  const milestones = SPRING_MILESTONES.map((m) => ({
    ...m,
    completed: answered >= m.questionsRequired,
  }));

  const nextMilestone = milestones.find((m) => !m.completed);
  const pct = nextMilestone
    ? Math.min(100, Math.round((answered / nextMilestone.questionsRequired) * 100))
    : 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.heroContainer}>
          <Text style={styles.heroEmoji}>🌸</Text>
          <Text style={styles.heroTitle}>{eventTitle}</Text>
          <Text style={styles.heroSubtitle}>Answer spring-themed questions to earn exclusive badges</Text>
          <View style={styles.endsRow}>
            <Text style={styles.endsText}>{t('eventEnds')}: April 30, 2026</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('eventProgress')}</Text>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : error ? (
            <TouchableOpacity onPress={loadProgress}>
              <Text style={styles.errorText}>{t('errorRetry')}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{answered}</Text>
                  <Text style={styles.statLabel}>Questions</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: COLORS.success }]}>
                    {progress?.correctAnswers ?? 0}
                  </Text>
                  <Text style={styles.statLabel}>Correct</Text>
                </View>
                {progress?.rank !== null && (
                  <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: COLORS.yellow }]}>
                      #{progress?.rank}
                    </Text>
                    <Text style={styles.statLabel}>{t('rank')}</Text>
                  </View>
                )}
              </View>

              {nextMilestone && (
                <>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${pct}%` as `${number}%` }]} />
                  </View>
                  <Text style={styles.progressLabel}>
                    {answered} / {nextMilestone.questionsRequired} to next milestone ({pct}%)
                  </Text>
                </>
              )}
            </>
          )}
        </View>

        {/* Milestones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Milestones</Text>
          {milestones.map((m, i) => (
            <View key={i} style={[styles.milestone, m.completed && styles.milestoneCompleted]}>
              <Text style={styles.milestoneEmoji}>{m.completed ? '✅' : '⬜'}</Text>
              <View style={styles.milestoneText}>
                <Text style={[styles.milestoneName, m.completed && { color: COLORS.success }]}>
                  {m.reward}
                </Text>
                <Text style={styles.milestoneReq}>
                  Answer {m.questionsRequired} questions
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* How to participate */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Participate</Text>
          <Text style={styles.howTo}>
            Play any game mode during the Spring Knowledge Sprint event. Spring-themed questions are
            automatically included in your game sessions. Your answers count towards event progress
            as long as the event is active.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: '#0d1f0a',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#22c55e40',
  },
  heroEmoji: { fontSize: 56, marginBottom: 8 },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  endsRow: {
    backgroundColor: '#164e1a',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 100,
  },
  endsText: { fontSize: 12, color: '#4ade80', fontWeight: '600' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  progressBarBg: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 5,
  },
  progressLabel: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  milestoneCompleted: { opacity: 0.8 },
  milestoneEmoji: { fontSize: 20, marginRight: 12 },
  milestoneText: { flex: 1 },
  milestoneName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  milestoneReq: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  errorText: { color: COLORS.textMuted, textAlign: 'center', fontSize: 14 },
  howTo: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22 },
});
