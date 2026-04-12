import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants';
import { StreakCounter } from '../../components/StreakCounter';
import {
  addFriendByCode,
  getFriends,
  getShareCode,
  type Friend,
} from '../../services/socialService';

export const FriendsScreen: React.FC = () => {
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
    } catch {
      // user cancelled
    }
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
    Alert.alert(result.success ? 'Success' : 'Error', result.message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.heading}>Friends</Text>

        {/* My share code card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Friend Code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{shareCode || '------'}</Text>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>Share 📤</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardHint}>Share this code so friends can add you</Text>
        </View>

        {/* Add friend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Friend</Text>
          <View style={styles.addRow}>
            <TextInput
              style={styles.input}
              value={addCode}
              onChangeText={setAddCode}
              placeholder="Enter friend code"
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
                : <Text style={styles.addBtnText}>Add</Text>
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
          : friends.map((friend) => (
            <FriendRow key={friend.id} friend={friend} />
          ))
        }

        {!loading && friends.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyText}>Share your code to invite friends!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const FriendRow: React.FC<{ friend: Friend }> = ({ friend }) => {
  const p = friend.friendProfile;
  return (
    <View style={styles.friendRow}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarEmoji}>👤</Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{p?.username ?? 'Player'}</Text>
        <Text style={styles.friendLevel}>Level {p?.level ?? 1}</Text>
      </View>
      <View style={styles.friendRight}>
        <Text style={styles.friendScore}>{(p?.totalScore ?? 0).toLocaleString()}</Text>
        <Text style={styles.friendScoreLabel}>pts</Text>
        {(p?.bestStreak ?? 0) >= 3 && (
          <StreakCounter streak={p!.bestStreak} size="small" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32, gap: 16 },
  heading: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  code: {
    flex: 1,
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 6,
  },
  shareBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  shareBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  cardHint: { fontSize: 12, color: COLORS.textMuted },
  addRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    minWidth: 70,
    alignItems: 'center',
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textMuted },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  friendAvatarEmoji: { fontSize: 20 },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  friendLevel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  friendRight: { alignItems: 'flex-end', gap: 4 },
  friendScore: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  friendScoreLabel: { fontSize: 10, color: COLORS.textMuted },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center' },
});
