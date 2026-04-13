export const COLORS = {
  background: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  primary: '#6366f1',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  // Additional semantic colors
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f97316',
  yellow: '#eab308',

  // ─── Duolingo brand palette (CHO-76) ────────────────────────────────────────
  brandGreen: '#58CC02',             // decorative only (icons, non-text fills)
  brandGreenDark: '#4CAD00',
  brandGreenAccessible: '#1A7A00',   // WCAG AA — use when green is a text-bearing bg
  brandBlue: '#1CB0F6',              // decorative only
  brandBlueAccessible: '#0065A6',    // WCAG AA — use when blue is a text-bearing bg
  brandPurple: '#CE82FF',
  brandOrange: '#FF9600',            // decorative only
  brandOrangeText: '#B36B00',        // WCAG AA — use for orange text on light/white bg
  brandRed: '#FF4B4B',
  brandRedDark: '#CC3B3B',
  brandYellow: '#FFD900',
  // ─── Accessible neutrals (CHO-135) ──────────────────────────────────────────
  placeholderText: '#767676',        // WCAG AA minimum on white
  lockedText: '#595959',             // WCAG AA on light bg

  // Answer card states
  correctBg: '#052e16',
  correctBorder: '#22c55e',
  wrongBg: '#450a0a',
  wrongBorder: '#ef4444',
  selectedBg: '#0c2a3a',
  selectedBorder: '#1CB0F6',
} as const;

// ─── World themes ─────────────────────────────────────────────────────────────
export const WORLD_THEMES = {
  easy: {
    name: 'Meadow',
    emoji: '🌿',
    color: '#22c55e',
    dimColor: '#166534',
    tint: '#052e16',
  },
  medium: {
    name: 'Volcano',
    emoji: '🌋',
    color: '#f97316',
    dimColor: '#9a3412',
    tint: '#431407',
  },
  hard: {
    name: 'Galaxy',
    emoji: '🌌',
    color: '#a78bfa',
    dimColor: '#5b21b6',
    tint: '#2e1065',
  },
} as const;

export type WorldKey = keyof typeof WORLD_THEMES;

export const WORLDS: Array<{ worldId: number; key: WorldKey; unlockAfterLevel: number }> = [
  { worldId: 1, key: 'easy',   unlockAfterLevel: 0  },
  { worldId: 2, key: 'medium', unlockAfterLevel: 10 },
  { worldId: 3, key: 'hard',   unlockAfterLevel: 20 },
];

export const LEVELS_PER_WORLD = 20;

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

export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 30 * 60 * 1000; // 30 min per heart
