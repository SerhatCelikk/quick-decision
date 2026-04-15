import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserStats {
  totalScore: number;
  bestStreak: number;
  gamesPlayed: number;
  correctAnswers: number;
  totalAnswers: number;
  level: number;
  passRate: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  preferredLanguage: 'en' | 'tr' | null;
}

// ─── Get full user stats via RPC ─────────────────────────────────────────────

export async function getUserStats(): Promise<UserStats | null> {
  const { data, error } = await supabase.rpc('get_user_stats');

  if (error || !data) return null;

  const row = data as {
    total_score: number;
    best_streak: number;
    games_played: number;
    correct_answers: number;
    total_answers: number;
    level: number;
    pass_rate: number;
  };

  return {
    totalScore:     row.total_score,
    bestStreak:     row.best_streak,
    gamesPlayed:    row.games_played,
    correctAnswers: row.correct_answers,
    totalAnswers:   row.total_answers,
    level:          row.level,
    passRate:       row.pass_rate,
  };
}

// ─── Get user profile ─────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('id, username, email, avatar_url, preferred_language')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;

  return {
    id:                data.id,
    username:          data.username,
    email:             data.email ?? null,
    avatarUrl:         data.avatar_url ?? null,
    preferredLanguage: data.preferred_language ?? null,
  };
}

// ─── Update username ──────────────────────────────────────────────────────────

export async function updateUsername(
  newUsername: string,
): Promise<{ success: boolean; message: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Giriş yapmanız gerekiyor' };

  const trimmed = newUsername.trim();
  if (trimmed.length < 3) {
    return { success: false, message: 'Kullanıcı adı en az 3 karakter olmalı' };
  }
  if (trimmed.length > 24) {
    return { success: false, message: 'Kullanıcı adı en fazla 24 karakter olabilir' };
  }

  const { error } = await supabase
    .from('users')
    .update({ username: trimmed })
    .eq('id', user.id);

  if (error) {
    if (error.code === '23505') {
      return { success: false, message: 'Bu kullanıcı adı zaten kullanılıyor' };
    }
    return { success: false, message: 'Kullanıcı adı güncellenemedi' };
  }

  return { success: true, message: 'Kullanıcı adı güncellendi!' };
}

// ─── Update preferred language ────────────────────────────────────────────────

export async function updatePreferredLanguage(
  lang: 'en' | 'tr',
): Promise<{ success: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const { error } = await supabase
    .from('users')
    .update({ preferred_language: lang })
    .eq('id', user.id);

  return { success: !error };
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<{ success: boolean }> {
  const { error } = await supabase.auth.signOut();
  return { success: !error };
}
