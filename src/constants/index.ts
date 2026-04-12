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

export interface LevelConfigEntry {
  level: number;
  questionCount: number;
  timerSeconds: number;
}

export const LEVEL_CONFIG: LevelConfigEntry[] = [
  { level: 1,  questionCount: 5,  timerSeconds: 10 },
  { level: 2,  questionCount: 6,  timerSeconds: 10 },
  { level: 3,  questionCount: 8,  timerSeconds: 8  },
  { level: 4,  questionCount: 8,  timerSeconds: 8  },
  { level: 5,  questionCount: 10, timerSeconds: 8  },
  { level: 6,  questionCount: 10, timerSeconds: 7  },
  { level: 7,  questionCount: 10, timerSeconds: 7  },
  { level: 8,  questionCount: 12, timerSeconds: 6  },
  { level: 9,  questionCount: 12, timerSeconds: 6  },
  { level: 10, questionCount: 12, timerSeconds: 5  },
  { level: 11, questionCount: 14, timerSeconds: 5  },
  { level: 12, questionCount: 14, timerSeconds: 5  },
  { level: 13, questionCount: 15, timerSeconds: 4  },
  { level: 14, questionCount: 15, timerSeconds: 4  },
  { level: 15, questionCount: 15, timerSeconds: 4  },
];

export function getLevelConfig(level: number): LevelConfigEntry {
  const cfg = LEVEL_CONFIG.find(c => c.level === level);
  if (cfg) return cfg;
  // Beyond defined levels: scale up
  return { level, questionCount: 15, timerSeconds: 4 };
}

export const PASS_THRESHOLD = 0.75;
