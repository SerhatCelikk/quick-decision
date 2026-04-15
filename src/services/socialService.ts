import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  friendProfile?: {
    username: string;
    totalScore: number;
    level: number;
    bestStreak: number;
  };
}

export interface PendingRequest {
  id: string;
  userId: string;
  friendId: string;
  createdAt: string;
  requesterProfile?: {
    username: string;
  };
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengedId: string;
  levelId: number;
  challengerScore: number;
  challengedScore?: number;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
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

export interface SocialStats {
  friends: number;
  pending: number;
  wins: number;
  battles: number;
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

// ─── Auth helpers ─────────────────────────────────────────────────────────────

async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ─── Share code ───────────────────────────────────────────────────────────────

/**
 * Returns the current user's share code.
 * The auth hook creates the row on sign-up; this just reads it.
 */
export async function getShareCode(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) return '';

  const { data } = await supabase
    .from('share_codes')
    .select('code')
    .eq('user_id', userId)
    .single();

  if (data?.code) return data.code;

  // Fallback: create one if the row somehow doesn't exist
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  await supabase.from('share_codes').insert({ user_id: userId, code });
  return code;
}

// ─── Friend by code ───────────────────────────────────────────────────────────

export async function addFriendByCode(
  code: string,
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('add_friend_by_code', {
    p_code: code.toUpperCase(),
  });

  if (error) return { success: false, message: error.message };

  const result = data as { success: boolean; error?: string };
  if (!result.success) {
    const errorMessages: Record<string, string> = {
      not_authenticated: 'Giriş yapmanız gerekiyor',
      code_not_found:    'Arkadaş kodu bulunamadı',
      cannot_add_self:   'Kendinizi ekleyemezsiniz',
      already_exists:    'Bu kişi zaten arkadaş listenizde',
    };
    return {
      success: false,
      message: errorMessages[result.error ?? ''] ?? 'Bir hata oluştu',
    };
  }

  return { success: true, message: 'Arkadaş eklendi!' };
}

// ─── Send friend request by username ─────────────────────────────────────────

export async function sendFriendRequest(
  username: string,
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('send_friend_request', {
    p_friend_username: username,
  });

  if (error) return { success: false, message: error.message };

  const result = data as { success: boolean; error?: string };
  if (!result.success) {
    const errorMessages: Record<string, string> = {
      not_authenticated: 'Giriş yapmanız gerekiyor',
      user_not_found:    'Kullanıcı bulunamadı',
      cannot_add_self:   'Kendinizi ekleyemezsiniz',
      already_exists:    'Bu kişiye zaten istek gönderildi veya arkadaşsınız',
    };
    return {
      success: false,
      message: errorMessages[result.error ?? ''] ?? 'Bir hata oluştu',
    };
  }

  return { success: true, message: 'Arkadaşlık isteği gönderildi!' };
}

// ─── Accept / decline requests ────────────────────────────────────────────────

export async function acceptFriendRequest(
  friendshipId: string,
): Promise<{ success: boolean }> {
  const { data, error } = await supabase.rpc('accept_friend_request', {
    p_friendship_id: friendshipId,
  });
  if (error) return { success: false };
  const result = data as { success: boolean };
  return { success: result.success };
}

export async function declineFriendRequest(
  friendshipId: string,
): Promise<{ success: boolean }> {
  const { data, error } = await supabase.rpc('decline_friend_request', {
    p_friendship_id: friendshipId,
  });
  if (error) return { success: false };
  const result = data as { success: boolean };
  return { success: result.success };
}

// ─── Get accepted friends ─────────────────────────────────────────────────────

export async function getFriends(): Promise<Friend[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data: rows, error } = await supabase
    .from('friendships')
    .select('id, user_id, friend_id, status, created_at')
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted');

  if (error || !rows) return [];

  const friends: Friend[] = await Promise.all(
    rows.map(async (row) => {
      const friendId = row.user_id === userId ? row.friend_id : row.user_id;

      const [{ data: userData }, { data: scores }, { data: progress }] =
        await Promise.all([
          supabase.from('users').select('username').eq('id', friendId).single(),
          supabase.from('scores').select('score, streak').eq('user_id', friendId),
          supabase
            .from('user_progress')
            .select('highest_level_unlocked')
            .eq('user_id', friendId)
            .single(),
        ]);

      const totalScore =
        scores?.reduce((s, r) => s + (r.score ?? 0), 0) ?? 0;
      const bestStreak =
        scores?.reduce((m, r) => Math.max(m, r.streak ?? 0), 0) ?? 0;

      return {
        id: row.id,
        userId: row.user_id,
        friendId,
        status: row.status as Friend['status'],
        createdAt: row.created_at,
        friendProfile: {
          username: userData?.username ?? 'Player',
          totalScore,
          level: progress?.highest_level_unlocked ?? 1,
          bestStreak,
        },
      };
    }),
  );

  return friends;
}

// ─── Get pending requests (received) ─────────────────────────────────────────

export async function getPendingRequests(): Promise<PendingRequest[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data: rows, error } = await supabase
    .from('friendships')
    .select('id, user_id, friend_id, created_at')
    .eq('friend_id', userId)
    .eq('status', 'pending');

  if (error || !rows) return [];

  const requests: PendingRequest[] = await Promise.all(
    rows.map(async (row) => {
      const { data: userData } = await supabase
        .from('users')
        .select('username')
        .eq('id', row.user_id)
        .single();

      return {
        id: row.id,
        userId: row.user_id,
        friendId: row.friend_id,
        createdAt: row.created_at,
        requesterProfile: {
          username: userData?.username ?? 'Player',
        },
      };
    }),
  );

  return requests;
}

// ─── Social stats (for SocialScreen banner) ───────────────────────────────────

export async function getSocialStats(): Promise<SocialStats> {
  const { data, error } = await supabase.rpc('get_social_stats');

  if (error || !data) {
    return { friends: 0, pending: 0, wins: 0, battles: 0 };
  }

  const result = data as {
    friends: number;
    pending: number;
    wins: number;
    battles: number;
  };

  return result;
}

// ─── Challenges ───────────────────────────────────────────────────────────────

export async function sendChallenge(
  challengedId: string,
  worldId: number,
  challengerScore: number,
): Promise<{ success: boolean; message: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, message: 'Giriş yapmanız gerekiyor' };

  const { error } = await supabase.from('challenges').insert({
    challenger_id: userId,
    challenged_id: challengedId,
    world_id: worldId,
    challenger_score: challengerScore,
    status: 'pending',
  });

  if (error) return { success: false, message: 'Meydan okuma gönderilemedi' };
  return { success: true, message: 'Meydan okuma gönderildi!' };
}

export async function getChallenges(): Promise<{
  incoming: Challenge[];
  outgoing: Challenge[];
}> {
  const userId = await getCurrentUserId();
  if (!userId) return { incoming: [], outgoing: [] };

  const { data: rows, error } = await supabase
    .from('challenges')
    .select(
      'id, challenger_id, challenged_id, world_id, challenger_score, challenged_score, status, created_at',
    )
    .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error || !rows) return { incoming: [], outgoing: [] };

  const enriched: Challenge[] = await Promise.all(
    rows.map(async (row) => {
      const [{ data: cProfile }, { data: dProfile }] = await Promise.all([
        supabase.from('users').select('username').eq('id', row.challenger_id).single(),
        supabase.from('users').select('username').eq('id', row.challenged_id).single(),
      ]);

      return {
        id: row.id,
        challengerId: row.challenger_id,
        challengedId: row.challenged_id,
        levelId: row.world_id ?? 1,
        challengerScore: row.challenger_score ?? 0,
        challengedScore: row.challenged_score ?? undefined,
        status: row.status as Challenge['status'],
        createdAt: row.created_at,
        challengerProfile: { username: cProfile?.username ?? 'Player' },
        challengedProfile: { username: dProfile?.username ?? 'Player' },
      };
    }),
  );

  return {
    incoming: enriched.filter((c) => c.challengedId === userId),
    outgoing: enriched.filter((c) => c.challengerId === userId),
  };
}

export async function respondToChallenge(
  challengeId: string,
  score: number,
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('challenges')
    .update({
      challenged_score: score,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', challengeId);

  return { success: !error };
}

export async function declineChallenge(
  challengeId: string,
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('challenges')
    .update({ status: 'declined' })
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
    supabase
      .from('user_progress')
      .select('highest_level_unlocked')
      .eq('user_id', userId)
      .single(),
    getShareCode(),
  ]);

  const totalScore = scores?.reduce((s, r) => s + (r.score ?? 0), 0) ?? 0;
  const bestStreak =
    scores?.reduce((m, r) => Math.max(m, r.streak ?? 0), 0) ?? 0;

  return {
    username: userData?.username ?? 'Player',
    totalScore,
    level: progressData?.highest_level_unlocked ?? 1,
    bestStreak,
    shareCode,
  };
}

// ─── Daily challenge ──────────────────────────────────────────────────────────

/**
 * Returns today's daily challenge.
 * Falls back to a static default if no DB row exists for today.
 */
export async function getDailyChallenge(): Promise<DailyChallenge | null> {
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('daily_challenges')
    .select('id, date, question_count, bonus_multiplier, category_id')
    .eq('date', today)
    .single();

  if (data) {
    // Construct a UI-friendly object from the DB row
    return {
      id:           data.id,
      title:        "Today's Challenge",
      description:  `Answer ${data.question_count} questions with ${data.bonus_multiplier}x bonus!`,
      levelId:      1,
      targetScore:  data.question_count * 100,
      expiresAt:    new Date(today + 'T23:59:59Z').toISOString(),
      participants: 0,
    };
  }

  // Static fallback so the banner always shows something useful
  return {
    id:           `daily-${today}`,
    title:        "Today's Challenge",
    description:  'Beat the daily target score!',
    levelId:      5,
    targetScore:  500,
    expiresAt:    new Date(today + 'T23:59:59Z').toISOString(),
    participants: 0,
  };
}
