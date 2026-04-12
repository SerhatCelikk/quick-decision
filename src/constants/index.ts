import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const SUPABASE_URL: string = extra['SUPABASE_URL'] ?? '';
export const SUPABASE_ANON_KEY: string = extra['SUPABASE_ANON_KEY'] ?? '';

export const COLORS = {
  background: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  primary: '#6366f1',
  text: '#f8fafc',
  textMuted: '#94a3b8',
} as const;
