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
  { questionsRequired: 5,  reward: 'Seedling Badge',      icon: 'leaf',     iconColor: '#00C060' },
  { questionsRequired: 15, reward: 'Blossom Badge',       icon: 'flower',   iconColor: '#FF6D9D' },
  { questionsRequired: 30, reward: 'Spring Scholar Badge', icon: 'sparkles', iconColor: '#FFD700' },
];

interface EventProgress { questionsAnswered: number; correctAnswers: number; rank: number | null }

export const SeasonalEventScreen: React.FC<Props> = ({ navigation, route }) => {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4F46E5', '#4338CA', '#3B35BC']} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('goBack')}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{eventTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <LinearGradient colors={['rgba(0,192,96,0.20)', 'rgba(0,192,96,0.06)']} style={styles.hero}>
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
                  : { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.14)' },
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

        {/* Info */}
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

  navBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14, gap: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    justifyContent: 'center', alignItems: 'center',
  },
  navTitle: {
    flex: 1, textAlign: 'center',
    fontFamily: 'NunitoSans_800ExtraBold',
    fontSize: 18, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.3,
  },

  scroll: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 32, gap: 14 },

  hero: {
    alignItems: 'center', borderRadius: 22, padding: 28, gap: 8,
    borderWidth: 1, borderColor: 'rgba(0,192,96,0.30)',
  },
  heroIconWrap: {
    width: 68, height: 68, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(0,192,96,0.40)', backgroundColor: 'rgba(0,192,96,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'center' },
  heroSubtitle: { fontFamily: 'NunitoSans_400Regular', fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19, paddingHorizontal: 10 },
  endsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,192,96,0.15)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 100,
    borderWidth: 1, borderColor: 'rgba(0,192,96,0.30)',
  },
  endsText: { fontFamily: 'NunitoSans_700Bold', fontSize: 12, color: '#00C060', fontWeight: '700' },

  card: {
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', gap: 12,
  },
  cardTitle: { fontFamily: 'NunitoSans_700Bold', fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.2, textTransform: 'uppercase' },

  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.14)' },
  statValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, fontWeight: '900', color: COLORS.text },
  statLabel: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  progressBarBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressLabel: { fontFamily: 'NunitoSans_400Regular', fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },

  milestone: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  milestoneBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.10)' },
  milestoneIcon: {
    width: 44, height: 44, borderRadius: 13, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  milestoneText: { flex: 1 },
  milestoneName: { fontFamily: 'NunitoSans_700Bold', fontSize: 14, fontWeight: '700', color: COLORS.text },
  milestoneReq: { fontFamily: 'NunitoSans_400Regular', fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  errorWrap: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  errorText: { fontFamily: 'NunitoSans_400Regular', color: COLORS.textMuted, fontSize: 14 },

  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.timerSafe + '30',
  },
  infoText: { flex: 1, fontFamily: 'NunitoSans_400Regular', fontSize: 13, color: COLORS.textMuted, lineHeight: 19 },
});
