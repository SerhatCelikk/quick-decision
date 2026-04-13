// ─── Design System v3 — Game-Quality ─────────────────────────────────────────
// Research basis: Duolingo, HQ Trivia, Candy Crush, Monument Valley
// Core principle: warm purple-black base makes all reactive colors POP

export const COLORS = {
  // ── Core backgrounds — warm purple-black (game feel, not corporate dark) ──
  background: '#09071A',
  surface:    '#130F2A',
  surface2:   '#1D1840',
  surface3:   '#271F58',
  border:     '#2D2760',
  borderLight:'#3D359C',

  // ── Primary: vivid coral — energetic, fun, NOT AI ──
  primary:      '#FF4C5E',
  primaryLight: '#FF7A89',
  primaryDark:  '#CC2E3E',
  primaryGlow:  'rgba(255,76,94,0.22)',

  // ── Accent: electric teal ──
  accent:      '#00D4CF',
  accentLight: '#26EDE7',
  accentDark:  '#00A8A4',

  // ── Gold for XP, stars, rewards ──
  gold:      '#FFD700',
  goldLight: '#FFE44D',
  goldDark:  '#CC9F00',

  // ── Text ──
  text:          '#F4F3FF',
  textSecondary: '#A09FCC',
  textMuted:     '#5C5A88',
  textOnColor:   '#FFFFFF',

  // ── Game-state colors: VIVID, reactive ──
  // Correct answer — electric green (not muted sage)
  success:       '#00E676',
  successBg:     '#00291A',
  successBorder: '#00E676',
  // Wrong answer — vivid red (distinct from primary coral)
  danger:       '#FF1744',
  dangerBg:     '#2A0010',
  dangerBorder: '#FF1744',
  // Warning / timer midpoint
  warning: '#FF9100',

  // ── Answer card states ──
  correctBg:     '#00291A',
  correctBorder: '#00E676',
  wrongBg:       '#2A0010',
  wrongBorder:   '#FF1744',
  // Selected-but-unrevealed: violet — creates visible tension
  selectedBg:     '#150A38',
  selectedBorder: '#9B6DFF',

  // ── Timer states (blue → orange → red) ──
  timerSafe:    '#2979FF',
  timerWarning: '#FF9100',
  timerDanger:  '#FF1744',

  // ── Streak ──
  streak:    '#FF6D00',
  streakHot: '#FF3D00',

  // ── Legacy compat — mapped to new palette ──
  yellow:               '#FFD700',
  brandGreen:           '#00E676',
  brandGreenDark:       '#00C060',
  brandGreenAccessible: '#008060',
  brandBlue:            '#2979FF',
  brandBlueAccessible:  '#0060CC',
  brandPurple:          '#9B6DFF',
  brandOrange:          '#FF6D00',
  brandOrangeText:      '#CC4400',
  brandRed:             '#FF1744',
  brandRedDark:         '#CC0030',
  brandYellow:          '#FFD700',
  placeholderText:      '#767699',
  lockedText:           '#45436A',
  cyan:                 '#00D4CF',
} as const;

// ─── Gradients ────────────────────────────────────────────────────────────────
export const GRADIENTS = {
  primary:     ['#FF4C5E', '#FF7A40'] as const,
  primaryDark: ['#CC2E3E', '#E04020'] as const,
  accent:      ['#00D4CF', '#26EDE7'] as const,
  // Game-state gradients (left-to-right sweep on reveal)
  correct:     ['#00BF5A', '#00E676', '#69FFB0'] as const,
  wrong:       ['#CC0030', '#FF1744'] as const,
  // Neutral selected (violet)
  selected:    ['#6B3FCC', '#9B6DFF'] as const,
  gold:        ['#CC9F00', '#FFD700', '#FFE44D'] as const,
  dark:        ['#130F2A', '#09071A'] as const,
  surface:     ['#1D1840', '#130F2A'] as const,
  // Atmospheric backgrounds
  gameBase:    ['#09071A', '#0D0A28', '#09071A'] as const,
  heroGlow:    ['rgba(255,76,94,0.12)', 'rgba(155,109,255,0.08)', 'transparent'] as const,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  displayXL: { fontSize: 40, fontWeight: '900' as const, letterSpacing: -1.5 },
  displayL:  { fontSize: 32, fontWeight: '800' as const, letterSpacing: -1 },
  displayM:  { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.5 },
  heading:   { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  subheading:{ fontSize: 18, fontWeight: '600' as const },
  body:      { fontSize: 16, fontWeight: '500' as const },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption:   { fontSize: 12, fontWeight: '500' as const },
  label:     { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.2, textTransform: 'uppercase' as const },
  score:     { fontSize: 48, fontWeight: '900' as const, letterSpacing: -2 },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const SHADOWS = {
  small:   { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4,  elevation: 3 },
  medium:  { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 8,  elevation: 6 },
  large:   { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 16, elevation: 10 },
  primary: { shadowColor: '#FF4C5E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6 },
  gold:    { shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 6 },
  correct: { shadowColor: '#00E676', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  wrong:   { shadowColor: '#FF1744', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────
export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999 } as const;

// ─── World themes ─────────────────────────────────────────────────────────────
export const WORLD_THEMES = {
  easy: {
    name: 'Jungle',
    icon: 'leaf',
    color: '#00E676',
    dimColor: '#004D2E',
    tint: '#002918',
    gradient: ['#003D2E', '#006650'] as const,
    nodeGradient: ['#008060', '#00E676'] as const,
    emoji: '🌿',
  },
  medium: {
    name: 'Volcano',
    icon: 'flame',
    color: '#FF6D00',
    dimColor: '#7A2D00',
    tint: '#3D1200',
    gradient: ['#5C1800', '#A02800'] as const,
    nodeGradient: ['#D04000', '#FF6D00'] as const,
    emoji: '🌋',
  },
  hard: {
    name: 'Ocean',
    icon: 'water',
    color: '#2979FF',
    dimColor: '#0A1E6E',
    tint: '#060E3A',
    gradient: ['#071040', '#0D2280'] as const,
    nodeGradient: ['#1040C0', '#2979FF'] as const,
    emoji: '🌊',
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
  return { level, questionCount: 15, timerSeconds: 4 };
}

export const PASS_THRESHOLD = 0.75;
export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 30 * 60 * 1000;
