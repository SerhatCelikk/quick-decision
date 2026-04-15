import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';
import { StreakCounter } from '../../components/StreakCounter';
import {
  addFriendByCode,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  getPendingRequests,
  getShareCode,
  type Friend,
  type PendingRequest,
} from '../../services/socialService';

export const FriendsScreen: React.FC = () => {
  const { t } = useI18n();
  const navigation = useNavigation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [shareCode, setShareCode] = useState('');
  const [addCode, setAddCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<'friends' | 'requests'>('friends');

  const load = useCallback(async () => {
    setLoading(true);
    const [f, p, code] = await Promise.all([
      getFriends(),
      getPendingRequests(),
      getShareCode(),
    ]);
    setFriends(f);
    setPending(p);
    setShareCode(code);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: t('friendShareMsg').replace('{code}', shareCode),
        title: t('friendShareTitle'),
      });
    } catch { /* user cancelled */ }
  };

  const handleAdd = async () => {
    const code = addCode.trim();
    if (!code) return;
    setAdding(true);
    const result = await addFriendByCode(code);
    setAdding(false);
    if (result.success) {
      setAddCode('');
      await load();
    }
    Alert.alert(
      result.success ? t('friendsSuccessTitle') : t('friendsErrorTitle'),
      result.message,
    );
  };

  const handleAccept = async (req: PendingRequest) => {
    const result = await acceptFriendRequest(req.id);
    if (result.success) {
      await load();
      Alert.alert(t('friendsSuccessTitle'), t('friendRequestAccepted'));
    }
  };

  const handleDecline = async (req: PendingRequest) => {
    const result = await declineFriendRequest(req.id);
    if (result.success) {
      await load();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#4F46E5', '#4338CA', '#3B35BC']} style={StyleSheet.absoluteFill} pointerEvents="none" />

      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel={t('goBack')}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{t('friends')}</Text>
        {pending.length > 0 ? (
          <View style={styles.navBadge}>
            <Text style={styles.navBadgeText}>{pending.length}</Text>
          </View>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* My share code card */}
        <View style={styles.codeCard}>
          <Text style={styles.cardTitle}>{t('myFriendCode')}</Text>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{shareCode || '------'}</Text>
            <TouchableOpacity style={styles.shareWrap} onPress={handleShare} activeOpacity={0.88}>
              <LinearGradient colors={['#FEF08A', '#FDE047']} style={styles.shareBtn}>
                <Ionicons name="share-social" size={16} color="#1E1B4B" />
                <Text style={styles.shareBtnText}>{t('share')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardHint}>{t('shareFriendCodeHint')}</Text>
        </View>

        {/* Add friend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('addFriend')}</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              value={addCode}
              onChangeText={setAddCode}
              placeholder={t('enterFriendCode')}
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
              maxLength={8}
            />
            <TouchableOpacity
              style={[styles.addBtn, !addCode.trim() && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={!addCode.trim() || adding}
            >
              {adding
                ? <ActivityIndicator color="#1E1B4B" size="small" />
                : <Text style={styles.addBtnText}>{t('add')}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'friends' && styles.tabActive]}
            onPress={() => setTab('friends')}
            activeOpacity={0.8}
          >
            <Ionicons name="people" size={15} color={tab === 'friends' ? '#1E1B4B' : COLORS.textMuted} />
            <Text style={[styles.tabText, tab === 'friends' && styles.tabTextActive]}>
              {t('friends')} ({friends.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'requests' && styles.tabActive]}
            onPress={() => setTab('requests')}
            activeOpacity={0.8}
          >
            <Ionicons name="mail" size={15} color={tab === 'requests' ? '#1E1B4B' : COLORS.textMuted} />
            <Text style={[styles.tabText, tab === 'requests' && styles.tabTextActive]}>
              {t('requests')} ({pending.length})
            </Text>
            {pending.length > 0 && tab !== 'requests' && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{pending.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
        ) : tab === 'friends' ? (
          <>
            {friends.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="people" size={40} color={COLORS.textMuted} />
                </View>
                <Text style={styles.emptyText}>{t('noFriendsYet')}</Text>
              </View>
            ) : (
              friends.map((friend) => <FriendRow key={friend.id} friend={friend} />)
            )}
          </>
        ) : (
          <>
            {pending.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="mail-open" size={40} color={COLORS.textMuted} />
                </View>
                <Text style={styles.emptyText}>{t('noPendingRequests')}</Text>
              </View>
            ) : (
              pending.map((req) => (
                <PendingRow
                  key={req.id}
                  request={req}
                  onAccept={() => handleAccept(req)}
                  onDecline={() => handleDecline(req)}
                />
              ))
            )}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const FriendRow: React.FC<{ friend: Friend }> = ({ friend }) => {
  const p = friend.friendProfile;
  const initials = (p?.username ?? 'P').slice(0, 2).toUpperCase();
  return (
    <View style={styles.friendRow}>
      <LinearGradient colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.08)']} style={styles.friendAvatar}>
        <Text style={styles.friendInitials}>{initials}</Text>
      </LinearGradient>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{p?.username ?? 'Player'}</Text>
        <View style={styles.friendMeta}>
          <Ionicons name="flash" size={11} color={COLORS.gold} />
          <Text style={styles.friendLevel}>Level {p?.level ?? 1}</Text>
        </View>
      </View>
      <View style={styles.friendRight}>
        <Text style={styles.friendScore}>{(p?.totalScore ?? 0).toLocaleString()}</Text>
        <Text style={styles.friendScoreLabel}>pts</Text>
        {(p?.bestStreak ?? 0) >= 3 && <StreakCounter streak={p!.bestStreak} size="small" />}
      </View>
    </View>
  );
};

const PendingRow: React.FC<{
  request: PendingRequest;
  onAccept: () => void;
  onDecline: () => void;
}> = ({ request, onAccept, onDecline }) => {
  const { t } = useI18n();
  const username = request.requesterProfile?.username ?? 'Player';
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <View style={styles.pendingRow}>
      <LinearGradient
        colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.08)']}
        style={styles.friendAvatar}
      >
        <Text style={styles.friendInitials}>{initials}</Text>
      </LinearGradient>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{username}</Text>
        <Text style={styles.pendingLabel}>{t('wantsToBeYourFriend')}</Text>
      </View>
      <View style={styles.pendingActions}>
        <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.85}>
          <Ionicons name="checkmark" size={16} color="#1E1B4B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.declineBtn} onPress={onDecline} activeOpacity={0.85}>
          <Ionicons name="close" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
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
  navBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.danger,
    justifyContent: 'center', alignItems: 'center',
  },
  navBadgeText: {
    fontFamily: 'NunitoSans_800ExtraBold', fontSize: 13, fontWeight: '900', color: '#fff',
  },

  scroll: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 32, gap: 12 },

  codeCard: {
    backgroundColor: 'rgba(255,255,255,0.11)', borderRadius: 18, padding: 18,
    borderWidth: 1.5, borderColor: COLORS.primary + '44', gap: 8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.11)', borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', gap: 10,
  },
  cardTitle: {
    fontFamily: 'NunitoSans_700Bold',
    fontSize: 10, fontWeight: '800', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  code: { flex: 1, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, fontWeight: '900', color: COLORS.primary, letterSpacing: 6 },
  shareWrap: { borderRadius: 12, overflow: 'hidden' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  shareBtnText: { fontFamily: 'NunitoSans_700Bold', fontSize: 13, fontWeight: '700', color: '#1E1B4B' },
  cardHint: { fontFamily: 'NunitoSans_400Regular', fontSize: 12, color: COLORS.textMuted },

  addRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.20)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text,
    fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, fontWeight: '700', letterSpacing: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  addBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 20,
    borderRadius: 12, justifyContent: 'center', minWidth: 70, alignItems: 'center',
  },
  addBtnDisabled: { opacity: 0.35 },
  addBtnText: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 15, fontWeight: '700', color: '#1E1B4B' },

  tabs: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14, padding: 4, gap: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 11, gap: 6,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { fontFamily: 'NunitoSans_700Bold', color: '#1E1B4B', fontWeight: '700' },
  tabBadge: {
    backgroundColor: COLORS.danger, borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  tabBadgeText: {
    fontFamily: 'NunitoSans_800ExtraBold', fontSize: 10, fontWeight: '900', color: '#fff',
  },

  friendRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: 14,
    gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
  },
  friendAvatar: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  friendInitials: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 16, fontWeight: '900', color: COLORS.text },
  friendInfo: { flex: 1 },
  friendName: { fontFamily: 'NunitoSans_700Bold', fontSize: 15, fontWeight: '700', color: COLORS.text },
  friendMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  friendLevel: { fontFamily: 'NunitoSans_400Regular', fontSize: 12, color: COLORS.textMuted },
  friendRight: { alignItems: 'flex-end', gap: 2 },
  friendScore: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, fontWeight: '900', color: COLORS.text },
  friendScoreLabel: { fontFamily: 'NunitoSans_400Regular', fontSize: 10, color: COLORS.textMuted },

  pendingRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: 14,
    gap: 12, borderWidth: 1, borderColor: 'rgba(253,224,71,0.25)',
  },
  pendingLabel: {
    fontFamily: 'NunitoSans_400Regular', fontSize: 12, color: COLORS.textMuted, marginTop: 2,
  },
  pendingActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  declineBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center', justifyContent: 'center',
  },

  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontFamily: 'NunitoSans_600SemiBold', fontSize: 15, color: COLORS.textMuted, textAlign: 'center' },
});
