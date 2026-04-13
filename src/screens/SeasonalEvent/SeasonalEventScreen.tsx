import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../../types';
import { supabase } from '../../services/supabase';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';

type Props = RootStackScreenProps<'SeasonalEvent'>;

interface Milestone { questionsRequired: number; reward: string; icon: string; iconColor: string; completed: boolean }

const SPRING_MILESTONES: Omit<Milestone, 'completed'>[] = [
  { questionsRequired: 5,  reward: 'Seedling Badge',      icon: 'leaf',    iconColor: '#00C060' },
  { questionsRequired: 15, reward: 'Blossom Badge',       icon: 'flower',  iconColor: '#FF6D9D' },
  { questionsRequired: 30, reward: 'Spring Scholar Badge', icon: 'sparkles', iconColor: '#FFD700' },
];

interface EventProgress { questionsAnswered: number; correctAnswers: number; rank: number | null }

export const SeasonalEventScreen: React.FC<Props> = ({ route }) => {
  const { eventTitle } = route.params;
  const { t } = useI18n();
  const [progress, setProgress] = useState<EventProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadProgress = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('seasonal_event_progress')
          .select('questions_answered, correct_answers')
          .eq('user_id', user.id).eq('event_key', 'spring_2026').single();
        setProgress({ questionsAnswered: data?.questions_answered ?? 0, correctAnswers: data?.correct_answers ?? 0, rank: null });
      } else {
        setProgress({ questionsAnswered: 0, correctAnswers: 0, rank: null });
      }
    } catch {
      setProgress({ questionsAnswered: 0, correctAnswers: 0, rank: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const answered = progress?.questionsAnswered ?? 0;
  const milestones: Milestone[] = SPRING_MILESTONES.map(m => ({ ...m, completed: answered >= m.questionsRequired }));
  const nextMilestone = milestones.find(m => !m.completed);
  const pct = nextMilestone ? Math.min(100, Math.round((answered / nextMilestone.questionsRequired) * 100)) : 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <LinearGradient colors={['#00200E', '#001A0A']} style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="leaf" size={36} color="#00C060" />
          </View>
          <Text style={styles.heroTitle}>{eventTitle}</Text>
          <Text style={styles.heroSubtitle}>{t('springEventSubtitle')}</Text>
          <View style={styles.endsRow}>
            <Ionicons name="time" size={12} color="#00C060" />
            <Text style={styles.endsText}>{t('eventEnds')}: {t('eventEndDate')}</Text>
          </View>
        </LinearGradient>

        {/* Progress card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('eventProgress')}</Text>
          {loading ? (
            <ActivityIndicator color={COLORS.success} />
          ) : error ? (
            <TouchableOpacity onPress={loadProgress} style={styles.errorWrap}>
              <Ionicons name="refresh-circle" size={24} color={COLORS.textMuted} />
              <Text style={styles.errorText}>{t('errorRetry')}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{answered}</Text>
                  <Text style={styles.statLabel}>{t('questionsLabel')}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: COLORS.success }]}>{progress?.correctAnswers ?? 0}</Text>
                  <Text style={styles.statLabel}>{t('correctLabel')}</Text>
                </View>
                {progress?.rank !== null && progress?.rank !== undefined && (
                  <>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                      <Text style={[styles.statValue, { color: COLORS.gold }]}>#{progress.rank}</Text>
                      <Text style={styles.statLabel}>{t('rank')}</Text>
                    </View>
                  </>
                )}
              </View>

              {nextMilestone && (
                <>
                  <View style={styles.progressBarBg}>
                    <LinearGradient
                      colors={['#00C060', '#00E676']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${pct}%` as `${number}%` }]}
                    />
                  </View>
                  <Text style={styles.progressLabel}>
                    {t('progressToMilestoneFmt')
                      .replace('{n}', String(answered))
                      .replace('{total}', String(nextMilestone.questionsRequired))
                      .replace('{pct}', String(pct))}
                  </Text>
                </>
              )}
            </>
          )}
        </View>

        {/* Milestones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('milestones')}</Text>
          {milestones.map((m, i) => (
            <View key={i} style={[styles.milestone, i < milestones.length - 1 && styles.milestoneBorder]}>
              <View style={[
                styles.milestoneIcon,
                m.completed
                  ? { backgroundColor: m.iconColor + '22', borderColor: m.iconColor + '55' }
                  : { backgroundColor: COLORS.border + '50', borderColor: COLORS.border },
              ]}>
                {m.completed
                  ? <Ionicons name={m.icon as any} size={20} color={m.iconColor} />
                  : <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
                }
              </View>
              <View style={styles.milestoneText}>
                <Text style={[styles.milestoneName, m.completed && { color: COLORS.success }]}>
                  {m.reward}
                </Text>
                <Text style={styles.milestoneReq}>{t('answerNQuestionsFmt').replace('{n}', String(m.questionsRequired))}</Text>
              </View>
              {m.completed && (
                <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
              )}
            </View>
          ))}
        </View>

        {/* How to participate */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={16} color={COLORS.timerSafe} />
          <Text style={styles.infoText}>{t('eventInfoText')}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32, gap: 14 },

  hero: {
    alignItems: 'center', borderRadius: 22, padding: 28, gap: 8,
    borderWidth: 1, borderColor: '#00C06033',
  },
  heroIconWrap: {
    width: 68, height: 68, borderRadius: 20, borderWidth: 1,
    borderColor: '#00C06055', backgroundColor: '#00C06020',
    justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'center' },
  heroSubtitle: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19, paddingHorizontal: 10 },
  endsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#00C06020', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 100,
    borderWidth: 1, borderColor: '#00C06033',
  },
  endsText: { fontSize: 12, color: '#00C060', fontWeight: '700' },

  card: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: COLORS.border, gap: 12,
  },
  cardTitle: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.2 },

  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  statValue: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  progressBarBg: { height: 10, backgroundColor: COLORS.surface2, borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressLabel: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },

  milestone: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  milestoneBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  milestoneIcon: {
    width: 44, height: 44, borderRadius: 13, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  milestoneText: { flex: 1 },
  milestoneName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  milestoneReq: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  errorWrap: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  errorText: { color: COLORS.textMuted, fontSize: 14 },

  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.timerSafe + '30',
  },
  infoText: { flex: 1, fontSize: 13, color: COLORS.textMuted, lineHeight: 19 },
});
