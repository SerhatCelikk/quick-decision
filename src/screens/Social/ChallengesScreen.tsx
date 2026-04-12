import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants';
import {
  getChallenges,
  respondToChallenge,
  type Challenge,
} from '../../services/socialService';

type Tab = 'incoming' | 'outgoing';

export const ChallengesScreen: React.FC = () => {
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
    // In a real flow this would navigate to the game, passing the challenge id
    // For now, record a mock score
    const mockScore = Math.floor(Math.random() * 500) + 100;
    const result = await respondToChallenge(challenge.id, mockScore);
    if (result.success) {
      await load();
      Alert.alert('Challenge Complete!', `You scored ${mockScore} pts vs ${challenge.challengerScore} pts`);
    }
  };

  const list = tab === 'incoming' ? incoming : outgoing;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Challenges</Text>

        {/* Tab switcher */}
        <View style={styles.tabs}>
          {(['incoming', 'outgoing'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'incoming' ? `Incoming (${incoming.length})` : `Outgoing (${outgoing.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading
          ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
          : list.map((c) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              isIncoming={tab === 'incoming'}
              onAccept={() => handleAccept(c)}
            />
          ))
        }

        {!loading && list.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{tab === 'incoming' ? '📬' : '📤'}</Text>
            <Text style={styles.emptyText}>
              {tab === 'incoming'
                ? 'No incoming challenges yet'
                : 'No challenges sent yet'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const StatusBadge: React.FC<{ status: Challenge['status'] }> = ({ status }) => {
  const colors: Record<Challenge['status'], string> = {
    pending: COLORS.warning,
    completed: COLORS.success,
    expired: COLORS.textMuted,
  };
  const labels: Record<Challenge['status'], string> = {
    pending: 'Pending',
    completed: 'Done',
    expired: 'Expired',
  };
  return (
    <View style={[styles.badge, { borderColor: colors[status] }]}>
      <Text style={[styles.badgeText, { color: colors[status] }]}>{labels[status]}</Text>
    </View>
  );
};

const ChallengeCard: React.FC<{
  challenge: Challenge;
  isIncoming: boolean;
  onAccept: () => void;
}> = ({ challenge, isIncoming, onAccept }) => {
  const opponent = isIncoming
    ? challenge.challengerProfile?.username ?? 'Unknown'
    : challenge.challengedProfile?.username ?? 'Unknown';

  const won =
    challenge.status === 'completed' &&
    challenge.challengedScore !== undefined &&
    (isIncoming
      ? challenge.challengedScore > challenge.challengerScore
      : challenge.challengerScore > challenge.challengedScore!);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardOpponent}>
          <Text style={styles.opponentEmoji}>{isIncoming ? '👊' : '📤'}</Text>
          <View>
            <Text style={styles.opponentName}>{opponent}</Text>
            <Text style={styles.cardMeta}>Level {challenge.levelId}</Text>
          </View>
        </View>
        <StatusBadge status={challenge.status} />
      </View>

      {/* Scores comparison */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreValue}>{challenge.challengerScore}</Text>
          <Text style={styles.scoreLabel}>
            {isIncoming ? opponent : 'You'}
          </Text>
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={styles.scoreBox}>
          {challenge.challengedScore !== undefined
            ? <>
                <Text style={[styles.scoreValue, won ? { color: COLORS.success } : {}]}>
                  {challenge.challengedScore}
                </Text>
                <Text style={styles.scoreLabel}>{isIncoming ? 'You' : opponent}</Text>
              </>
            : <>
                <Text style={styles.scoreValue}>—</Text>
                <Text style={styles.scoreLabel}>{isIncoming ? 'Your score' : opponent}</Text>
              </>
          }
        </View>
      </View>

      {/* Result banner */}
      {challenge.status === 'completed' && (
        <View style={[styles.resultBanner, { backgroundColor: won ? '#052e16' : '#450a0a' }]}>
          <Text style={[styles.resultText, { color: won ? COLORS.success : COLORS.danger }]}>
            {won ? '🏆 You won!' : '😤 You lost — challenge them back!'}
          </Text>
        </View>
      )}

      {/* Accept CTA */}
      {isIncoming && challenge.status === 'pending' && (
        <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
          <Text style={styles.acceptBtnText}>Accept Challenge ⚡</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32, gap: 14 },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: '#fff' },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardOpponent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  opponentEmoji: { fontSize: 24 },
  opponentName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    gap: 16,
  },
  scoreBox: { flex: 1, alignItems: 'center', gap: 4 },
  scoreValue: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  scoreLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase' },
  vs: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  resultBanner: {
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  resultText: { fontSize: 14, fontWeight: '700' },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center' },
});
