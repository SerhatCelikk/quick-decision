import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';
import {
  getChallenges, respondToChallenge, type Challenge,
} from '../../services/socialService';

type Tab = 'incoming' | 'outgoing';

export const ChallengesScreen: React.FC = () => {
  const { t: tr } = useI18n();
  const [tab, setTab] = useState<Tab>('incoming');
  const [incoming, setIncoming] = useState<Challenge[]>([]);
  const [outgoing, setOutgoing] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getChallenges();
    setIncoming(data.incoming);
    setOutgoing(data.outgoing);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (challenge: Challenge) => {
    const mockScore = Math.floor(Math.random() * 500) + 100;
    const result = await respondToChallenge(challenge.id, mockScore);
    if (result.success) {
      await load();
      Alert.alert(
        tr('challengeCompleteTitle'),
        tr('challengeCompleteBody')
          .replace('{score}', String(mockScore))
          .replace('{opponentScore}', String(challenge.challengerScore)),
      );
    }
  };

  const list = tab === 'incoming' ? incoming : outgoing;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <Ionicons name="flash" size={22} color={COLORS.primary} />
          <Text style={styles.heading}>{tr('challenges')}</Text>
          {incoming.length > 0 && (
            <View style={styles.incomingBadge}>
              <Text style={styles.incomingBadgeText}>{incoming.length}</Text>
            </View>
          )}
        </View>

        {/* Tab switcher */}
        <View style={styles.tabs}>
          {(['incoming', 'outgoing'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={t === 'incoming' ? 'arrow-down-circle' : 'arrow-up-circle'}
                size={15}
                color={tab === t ? '#fff' : COLORS.textMuted}
              />
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'incoming' ? `${tr('incomingTab')} (${incoming.length})` : `${tr('outgoingTab')} (${outgoing.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading
          ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
          : list.map((c) => (
            <ChallengeCard key={c.id} challenge={c} isIncoming={tab === 'incoming'} onAccept={() => handleAccept(c)} />
          ))
        }

        {!loading && list.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name={tab === 'incoming' ? 'mail-unread' : 'paper-plane'} size={36} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyText}>
              {tab === 'incoming' ? tr('noIncomingChallenges') : tr('noOutgoingChallenges')}
            </Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const StatusBadge: React.FC<{ status: Challenge['status'] }> = ({ status }) => {
  const { t: tr } = useI18n();
  const STATUS_CONFIG_LOCAL: Record<Challenge['status'], { icon: string; color: string; labelKey: 'pendingStatus' | 'completedStatus' | 'expiredStatus' }> = {
    pending:   { icon: 'time',             color: COLORS.timerWarning, labelKey: 'pendingStatus' },
    completed: { icon: 'checkmark-circle', color: COLORS.success,      labelKey: 'completedStatus' },
    expired:   { icon: 'close-circle',     color: COLORS.textMuted,    labelKey: 'expiredStatus' },
  };
  const cfg = STATUS_CONFIG_LOCAL[status];
  return (
    <View style={[styles.badge, { borderColor: cfg.color + '88', backgroundColor: cfg.color + '15' }]}>
      <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{tr(cfg.labelKey)}</Text>
    </View>
  );
};

const ChallengeCard: React.FC<{
  challenge: Challenge; isIncoming: boolean; onAccept: () => void;
}> = ({ challenge, isIncoming, onAccept }) => {
  const { t: tr } = useI18n();
  const opponent = isIncoming
    ? challenge.challengerProfile?.username ?? 'Unknown'
    : challenge.challengedProfile?.username ?? 'Unknown';

  const won = challenge.status === 'completed' && challenge.challengedScore !== undefined && (
    isIncoming
      ? challenge.challengedScore > challenge.challengerScore
      : challenge.challengerScore > challenge.challengedScore!
  );

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <View style={styles.cardOpponent}>
          <View style={[styles.opponentAvatar, {
            backgroundColor: isIncoming ? COLORS.primary + '20' : COLORS.accent + '20',
            borderColor: isIncoming ? COLORS.primary + '44' : COLORS.accent + '44',
          }]}>
            <Ionicons
              name={isIncoming ? 'arrow-down' : 'arrow-up'}
              size={16}
              color={isIncoming ? COLORS.primary : COLORS.accent}
            />
          </View>
          <View>
            <Text style={styles.opponentName}>{opponent}</Text>
            <Text style={styles.cardMeta}>Level {challenge.levelId}</Text>
          </View>
        </View>
        <StatusBadge status={challenge.status} />
      </View>

      {/* Scores */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>{challenge.challengerScore}</Text>
          <Text style={styles.scoreLabel}>{isIncoming ? opponent : tr('you')}</Text>
        </View>
        <View style={styles.vsWrap}>
          <Text style={styles.vs}>VS</Text>
        </View>
        <View style={styles.scoreBox}>
          {challenge.challengedScore !== undefined ? (
            <>
              <Text style={[styles.scoreValue, won && { color: COLORS.success }]}>
                {challenge.challengedScore}
              </Text>
              <Text style={styles.scoreLabel}>{isIncoming ? tr('you') : opponent}</Text>
            </>
          ) : (
            <>
              <Text style={styles.scoreValueDash}>—</Text>
              <Text style={styles.scoreLabel}>{isIncoming ? tr('yourScorePending') : opponent}</Text>
            </>
          )}
        </View>
      </View>

      {/* Result banner */}
      {challenge.status === 'completed' && (
        <View style={[styles.resultBanner, { backgroundColor: won ? '#001F0A' : '#1F0008' }]}>
          <Ionicons name={won ? 'trophy' : 'refresh'} size={14} color={won ? COLORS.success : COLORS.danger} />
          <Text style={[styles.resultText, { color: won ? COLORS.success : COLORS.danger }]}>
            {won ? tr('youWonBattle') : tr('youLostBattle')}
          </Text>
        </View>
      )}

      {/* Accept CTA */}
      {isIncoming && challenge.status === 'pending' && (
        <TouchableOpacity style={styles.acceptWrap} onPress={onAccept} activeOpacity={0.88}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.acceptBtn}>
            <Ionicons name="flash" size={16} color="#fff" />
            <Text style={styles.acceptBtnText}>{tr('acceptChallenge')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 12 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heading: { flex: 1, fontSize: 26, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  incomingBadge: {
    backgroundColor: COLORS.danger, width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
  },
  incomingBadgeText: { fontSize: 11, fontWeight: '900', color: '#fff' },

  tabs: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: 14, padding: 4, gap: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 11, gap: 6,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: '#fff', fontWeight: '700' },

  card: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 16,
    gap: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardOpponent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  opponentAvatar: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  opponentName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },

  scoresRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: 12, padding: 14,
  },
  scoreBox: { flex: 1, alignItems: 'center', gap: 4 },
  scoreValue: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  scoreValueDash: { fontSize: 24, fontWeight: '900', color: COLORS.textMuted },
  scoreLabel: { fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: '600', letterSpacing: 0.5 },
  vsWrap: { paddingHorizontal: 16 },
  vs: { fontSize: 12, fontWeight: '900', color: COLORS.textMuted, letterSpacing: 1 },

  resultBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 10, padding: 10,
  },
  resultText: { fontSize: 13, fontWeight: '700' },

  acceptWrap: { borderRadius: 12, overflow: 'hidden' },
  acceptBtn: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  acceptBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.surface2,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center' },
});
