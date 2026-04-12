import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted';
  createdAt: string;
  friendProfile?: {
    username: string;
    totalScore: number;
    level: number;
    bestStreak: number;
  };
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengedId: string;
  levelId: number;
  challengerScore: number;
  challengedScore?: number;
  status: 'pending' | 'completed' | 'expired';
  createdAt: string;
  challengerProfile?: { username: string };
  challengedProfile?: { username: string };
}

export interface ShareData {
  username: string;
  totalScore: number;
  level: number;
  bestStreak: number;
  shareCode: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  levelId: number;
  targetScore: number;
  expiresAt: string;
  participants: number;
}

// ─── Friend helpers ───────────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getShareCode(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) return '';

  // Try to get existing share code
  const { data } = await supabase
    .from('share_codes')
    .select('code')
    .eq('user_id', userId)
    .single();

  if (data?.code) return data.code;

  // Generate a new one (6-char alphanumeric)
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  await supabase
    .from('share_codes')
    .insert({ user_id: userId, code });

  return code;
}

export async function addFriendByCode(code: string): Promise<{ success: boolean; message: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, message: 'Not signed in' };

  const { data: shareCodeRow } = await supabase
    .from('share_codes')
    .select('user_id')
    .eq('code', code.toUpperCase())
    .single();

  if (!shareCodeRow) return { success: false, message: 'Friend code not found' };
  if (shareCodeRow.user_id === userId) return { success: false, message: 'Cannot add yourself' };

  const { error } = await supabase
    .from('friendships')
    .insert({ user_id: userId, friend_id: shareCodeRow.user_id, status: 'accepted' });

  if (error) {
    if (error.code === '23505') return { success: false, message: 'Already friends' };
    return { success: false, message: 'Failed to add friend' };
  }

  return { success: true, message: 'Friend added!' };
}

export async function getFriends(): Promise<Friend[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data } = await supabase
    .from('friendships')
    .select(`
      id,
      user_id,
      friend_id,
      status,
      created_at
    `)
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (!data) return [];

  const friends: Friend[] = await Promise.all(
    data.map(async (row) => {
      const friendId = row.user_id === userId ? row.friend_id : row.user_id;

      // Get friend profile
      const { data: userData } = await supabase
        .from('users')
        .select('username')
        .eq('id', friendId)
        .single();

      const { data: scores } = await supabase
        .from('scores')
        .select('score, streak')
        .eq('user_id', friendId);

      const { data: progress } = await supabase
        .from('level_progress')
        .select('current_level')
        .eq('user_id', friendId)
        .single();

      const totalScore = scores?.reduce((s, r) => s + (r.score ?? 0), 0) ?? 0;
      const bestStreak = scores?.reduce((m, r) => Math.max(m, r.streak ?? 0), 0) ?? 0;

      return {
        id: row.id,
        userId: row.user_id,
        friendId,
        status: row.status as 'accepted',
        createdAt: row.created_at,
        friendProfile: {
          username: userData?.username ?? 'Player',
          totalScore,
          level: progress?.current_level ?? 1,
          bestStreak,
        },
      };
    })
  );

  return friends;
}

// ─── Challenge helpers ────────────────────────────────────────────────────────

export async function sendChallenge(
  challengedId: string,
  levelId: number,
  challengerScore: number
): Promise<{ success: boolean; message: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, message: 'Not signed in' };

  const { error } = await supabase
    .from('challenges')
    .insert({
      challenger_id: userId,
      challenged_id: challengedId,
      level_id: levelId,
      challenger_score: challengerScore,
      status: 'pending',
    });

  if (error) return { success: false, message: 'Failed to send challenge' };
  return { success: true, message: 'Challenge sent!' };
}

export async function getChallenges(): Promise<{ incoming: Challenge[]; outgoing: Challenge[] }> {
  const userId = await getCurrentUserId();
  if (!userId) return { incoming: [], outgoing: [] };

  const { data } = await supabase
    .from('challenges')
    .select(`
      id,
      challenger_id,
      challenged_id,
      level_id,
      challenger_score,
      challenged_score,
      status,
      created_at
    `)
    .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (!data) return { incoming: [], outgoing: [] };

  const enriched: Challenge[] = await Promise.all(
    data.map(async (row) => {
      const [{ data: cProfile }, { data: dProfile }] = await Promise.all([
        supabase.from('users').select('username').eq('id', row.challenger_id).single(),
        supabase.from('users').select('username').eq('id', row.challenged_id).single(),
      ]);
      return {
        id: row.id,
        challengerId: row.challenger_id,
        challengedId: row.challenged_id,
        levelId: row.level_id,
        challengerScore: row.challenger_score,
        challengedScore: row.challenged_score ?? undefined,
        status: row.status as Challenge['status'],
        createdAt: row.created_at,
        challengerProfile: { username: cProfile?.username ?? 'Player' },
        challengedProfile: { username: dProfile?.username ?? 'Player' },
      };
    })
  );

  return {
    incoming: enriched.filter((c) => c.challengedId === userId),
    outgoing: enriched.filter((c) => c.challengerId === userId),
  };
}

export async function respondToChallenge(
  challengeId: string,
  score: number
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('challenges')
    .update({ challenged_score: score, status: 'completed' })
    .eq('id', challengeId);

  return { success: !error };
}

// ─── Share card data ──────────────────────────────────────────────────────────

export async function getShareData(): Promise<ShareData | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [
    { data: userData },
    { data: scores },
    { data: progressData },
    shareCode,
  ] = await Promise.all([
    supabase.from('users').select('username').eq('id', userId).single(),
    supabase.from('scores').select('score, streak').eq('user_id', userId),
    supabase.from('level_progress').select('current_level').eq('user_id', userId).single(),
    getShareCode(),
  ]);

  const totalScore = scores?.reduce((s, r) => s + (r.score ?? 0), 0) ?? 0;
  const bestStreak = scores?.reduce((m, r) => Math.max(m, r.streak ?? 0), 0) ?? 0;

  return {
    username: userData?.username ?? 'Player',
    totalScore,
    level: progressData?.current_level ?? 1,
    bestStreak,
    shareCode,
  };
}

// ─── Daily challenge ──────────────────────────────────────────────────────────

export async function getDailyChallenge(): Promise<DailyChallenge | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('daily_challenges')
    .select('*')
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (data) {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      levelId: data.level_id,
      targetScore: data.target_score,
      expiresAt: data.expires_at,
      participants: data.participants ?? 0,
    };
  }

  // Fallback mock if no DB entry yet
  return {
    id: `daily-${today}`,
    title: "Today's Challenge",
    description: 'Beat the daily target score!',
    levelId: 5,
    targetScore: 500,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    participants: 128,
  };
}
