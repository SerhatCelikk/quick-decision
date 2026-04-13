import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { useI18n } from '../../i18n';
import { StreakCounter } from '../../components/StreakCounter';
import {
  addFriendByCode, getFriends, getShareCode, type Friend,
} from '../../services/socialService';

export const FriendsScreen: React.FC = () => {
  const { t } = useI18n();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [shareCode, setShareCode] = useState('');
  const [addCode, setAddCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [f, code] = await Promise.all([getFriends(), getShareCode()]);
    setFriends(f);
    setShareCode(code);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Add me on Quick Decision! My friend code is: ${shareCode}\nDownload the app and enter my code to challenge me!`,
        title: 'Quick Decision — Friend Request',
      });
    } catch { /* user cancelled */ }
  };

  const handleAdd = async () => {
    const code = addCode.trim();
    if (!code) return;
    setAdding(true);
    const result = await addFriendByCode(code);
    setAdding(false);
    if (result.success) { setAddCode(''); await load(); }
    Alert.alert(result.success ? 'Success' : 'Error', result.message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Friends</Text>
          <View style={[styles.countBadge, friends.length > 0 && { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary + '55' }]}>
            <Text style={[styles.countText, friends.length > 0 && { color: COLORS.primary }]}>{friends.length}</Text>
          </View>
        </View>

        {/* My share code card */}
        <View style={styles.codeCard}>
          <Text style={styles.cardTitle}>{t('myFriendCode')}</Text>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{shareCode || '------'}</Text>
            <TouchableOpacity style={styles.shareWrap} onPress={handleShare} activeOpacity={0.88}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.shareBtn}>
                <Ionicons name="share-social" size={16} color="#fff" />
                <Text style={styles.shareBtnText}>Share</Text>
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
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.addBtnText}>{t('add')}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* Friend list */}
        <Text style={styles.sectionTitle}>
          {friends.length > 0 ? `Friends (${friends.length})` : 'No friends yet'}
        </Text>

        {loading
          ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
          : friends.map((friend) => <FriendRow key={friend.id} friend={friend} />)
        }

        {!loading && friends.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="people" size={40} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyText}>{t('noFriendsYet')}</Text>
          </View>
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
      <LinearGradient colors={[COLORS.surface2, COLORS.border]} style={styles.friendAvatar}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 12 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heading: { fontSize: 26, fontWeight: '900', color: COLORS.text, letterSpacing: -0.5 },
  countBadge: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
    backgroundColor: COLORS.surface2, borderWidth: 1, borderColor: COLORS.border,
  },
  countText: { fontSize: 14, fontWeight: '800', color: COLORS.textMuted },

  codeCard: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 18,
    borderWidth: 1.5, borderColor: COLORS.primary + '44', gap: 8,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: COLORS.border, gap: 10,
  },
  cardTitle: {
    fontSize: 10, fontWeight: '800', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.2,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  code: { flex: 1, fontSize: 28, fontWeight: '900', color: COLORS.primary, letterSpacing: 6 },
  shareWrap: { borderRadius: 12, overflow: 'hidden' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  shareBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  cardHint: { fontSize: 12, color: COLORS.textMuted },

  addRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, backgroundColor: COLORS.background, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, color: COLORS.text,
    fontSize: 16, fontWeight: '700', letterSpacing: 3,
    borderWidth: 1, borderColor: COLORS.border,
  },
  addBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 20,
    borderRadius: 12, justifyContent: 'center', minWidth: 70, alignItems: 'center',
  },
  addBtnDisabled: { opacity: 0.35 },
  addBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' },

  friendRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14,
    gap: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  friendAvatar: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  friendInitials: { fontSize: 16, fontWeight: '900', color: COLORS.text },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  friendMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  friendLevel: { fontSize: 12, color: COLORS.textMuted },
  friendRight: { alignItems: 'flex-end', gap: 2 },
  friendScore: { fontSize: 17, fontWeight: '900', color: COLORS.text },
  friendScoreLabel: { fontSize: 10, color: COLORS.textMuted },

  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.surface2,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center' },
});
