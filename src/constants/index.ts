// ─── Design System v7 — "Pixel Festival" ─────────────────────────────────────
// Vivid indigo mid-tone base + electric yellow + hot pink
// NOT dark/black, NOT light/white — pure vibrant gaming palette
// Inspired by Brawl Stars / Clash Royale energy

export const COLORS = {
  // ── Core — vivid indigo (mid-tone, NOT dark navy) ──
  background:   '#4338CA',
  surfaceSolid: '#3730A3',
  surface:      'rgba(255,255,255,0.11)',
  surface2:     'rgba(255,255,255,0.07)',
  surface3:     'rgba(255,255,255,0.04)',
  border:       'rgba(255,255,255,0.18)',
  borderLight:  'rgba(255,255,255,0.09)',

  // ── Primary: electric yellow — max contrast, max energy ──
  primary:      '#FDE047',
  primaryLight: '#FEF08A',
  primaryDark:  '#CA8A04',
  primaryGlow:  'rgba(253,224,71,0.28)',

  // ── Accent: hot pink/fuchsia ──
  accent:      '#F471B5',
  accentLight: '#FBCFE8',
  accentDark:  '#BE185D',

  // ── Gold ──
  gold:      '#FDE047',
  goldLight: '#FEF08A',
  goldDark:  '#CA8A04',

  // ── Text — white hierarchy on indigo ──
  text:          '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.75)',
  textMuted:     'rgba(255,255,255,0.45)',
  textOnColor:   '#1E1B4B',
  textOnPrimary: '#1E1B4B',

  // ── Game states ──
  success:       '#4ADE80',
  successBg:     'rgba(74,222,128,0.18)',
  successBorder: 'rgba(74,222,128,0.45)',

  danger:       '#F87171',
  dangerBg:     'rgba(248,113,113,0.18)',
  dangerBorder: 'rgba(248,113,113,0.45)',

  warning: '#FB923C',

  // ── Answer states ──
  correctBg:     'rgba(74,222,128,0.20)',
  correctBorder: '#4ADE80',
  wrongBg:       'rgba(248,113,113,0.20)',
  wrongBorder:   '#F87171',
  selectedBg:    'rgba(253,224,71,0.18)',
  selectedBorder:'#FDE047',

  // ── Timer ──
  timerSafe:    '#4ADE80',
  timerWarning: '#FB923C',
  timerDanger:  '#F87171',

  // ── Streak ──
  streak:    '#FB923C',
  streakHot: '#F87171',

  // ── Legacy compat ──
  yellow:               '#FDE047',
  brandGreen:           '#4ADE80',
  brandGreenDark:       '#16A34A',
  brandGreenAccessible: '#15803D',
  brandBlue:            '#60A5FA',
  brandBlueAccessible:  '#3B82F6',
  brandPurple:          '#C084FC',
  brandOrange:          '#FB923C',
  brandOrangeText:      '#EA580C',
  brandRed:             '#F87171',
  brandRedDark:         '#DC2626',
  brandYellow:          '#FDE047',
  placeholderText:      'rgba(255,255,255,0.40)',
  lockedText:           'rgba(255,255,255,0.40)',
  cyan:                 '#22D3EE',
} as const;

// ─── Gradients ────────────────────────────────────────────────────────────────
export const GRADIENTS = {
  primary:      ['#FEF08A', '#FDE047'] as const,
  primaryDark:  ['#CA8A04', '#92400E'] as const,
  accent:       ['#F9A8D4', '#F471B5'] as const,
  correct:      ['rgba(74,222,128,0.35)', 'rgba(74,222,128,0.10)'] as const,
  wrong:        ['rgba(248,113,113,0.35)', 'rgba(248,113,113,0.10)'] as const,
  selected:     ['rgba(253,224,71,0.30)', 'rgba(253,224,71,0.10)'] as const,
  gold:         ['#FEF08A', '#FDE047', '#CA8A04'] as const,
  dark:         ['#4F46E5', '#4338CA'] as const,
  surface:      ['rgba(255,255,255,0.13)', 'rgba(255,255,255,0.06)'] as const,
  gameBase:     ['#4338CA', '#3B35BC', '#4338CA'] as const,
  heroGlow:     ['rgba(253,224,71,0.14)', 'rgba(244,113,181,0.08)', 'transparent'] as const,
  correctGlow:  ['rgba(74,222,128,0.45)', 'rgba(74,222,128,0.10)'] as const,
  primarySheen: ['#FEF08A', '#FDE047', '#F59E0B'] as const,
  accentSheen:  ['#F471B5', '#4ADE80'] as const,
  podium1:      ['#CA8A04', '#FDE047', '#FEF08A'] as const,
  podium2:      ['#4B5563', '#6B7280', '#9CA3AF'] as const,
  podium3:      ['#78350F', '#CD7F32'] as const,
  light:        ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)'] as const,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  displayXL: { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 42, fontWeight: '900' as const, letterSpacing: -1.5 },
  displayL:  { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 34, fontWeight: '800' as const, letterSpacing: -1 },
  displayM:  { fontFamily: 'NunitoSans_700Bold',      fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  heading:   { fontFamily: 'NunitoSans_700Bold',      fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.2 },
  subheading:{ fontFamily: 'NunitoSans_600SemiBold',  fontSize: 18, fontWeight: '600' as const },
  body:      { fontFamily: 'NunitoSans_600SemiBold',  fontSize: 16, fontWeight: '600' as const },
  bodySmall: { fontFamily: 'NunitoSans_400Regular',   fontSize: 14, fontWeight: '400' as const },
  caption:   { fontFamily: 'NunitoSans_700Bold',      fontSize: 12, fontWeight: '700' as const },
  label:     { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 11, fontWeight: '800' as const, letterSpacing: 1.2, textTransform: 'uppercase' as const },
  score:     { fontFamily: 'SpaceGrotesk_700Bold',    fontSize: 52, fontWeight: '900' as const, letterSpacing: -3 },
  btnLabel:  { fontFamily: 'NunitoSans_800ExtraBold', fontSize: 17, fontWeight: '800' as const, letterSpacing: 0.4 },
} as const;

export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

export const SHADOWS = {
  small:   { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4,  elevation: 3 },
  medium:  { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.40, shadowRadius: 8,  elevation: 5 },
  large:   { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8 },
  primary: { shadowColor: '#FDE047', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.55, shadowRadius: 14, elevation: 10 },
  gold:    { shadowColor: '#FDE047', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.55, shadowRadius: 14, elevation: 10 },
  correct: { shadowColor: '#4ADE80', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 10, elevation: 6  },
  wrong:   { shadowColor: '#F87171', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 10, elevation: 6  },
} as const;

export const GLOW = {
  primary: { shadowColor: '#FDE047', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.65, shadowRadius: 16, elevation: 12 },
  success: { shadowColor: '#4ADE80', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.60, shadowRadius: 12, elevation: 8  },
  danger:  { shadowColor: '#F87171', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.60, shadowRadius: 12, elevation: 8  },
  gold:    { shadowColor: '#FDE047', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.65, shadowRadius: 16, elevation: 12 },
  accent:  { shadowColor: '#F471B5', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.60, shadowRadius: 12, elevation: 8  },
  purple:  { shadowColor: '#C084FC', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 10, elevation: 6  },
  streak:  { shadowColor: '#FB923C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 10, elevation: 6  },
  subtle:  { shadowColor: '#000',    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 6,  elevation: 4  },
} as const;

export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 999 } as const;

export const WORLD_THEMES = {
  jungle: {
    name: 'Jungle',
    nameTR: 'Orman',
    difficulty: 'easy' as const,
    categoryName: 'Animals',
    icon: 'leaf',
    color: '#4ADE80',
    dimColor: 'rgba(74,222,128,0.22)',
    tint: 'rgba(74,222,128,0.10)',
    gradient: ['#166534', '#16A34A', '#4ADE80'] as const,
    nodeGradient: ['#166534', '#4ADE80'] as const,
    emoji: '🌿',
  },
  space: {
    name: 'Space',
    nameTR: 'Uzay',
    difficulty: 'easy' as const,
    categoryName: 'Science',
    icon: 'planet',
    color: '#818CF8',
    dimColor: 'rgba(129,140,248,0.22)',
    tint: 'rgba(129,140,248,0.10)',
    gradient: ['#1E1B4B', '#3730A3', '#818CF8'] as const,
    nodeGradient: ['#1E1B4B', '#818CF8'] as const,
    emoji: '🚀',
  },
  ruins: {
    name: 'Ancient Ruins',
    nameTR: 'Antik Kalıntılar',
    difficulty: 'medium' as const,
    categoryName: 'History',
    icon: 'business',
    color: '#F59E0B',
    dimColor: 'rgba(245,158,11,0.22)',
    tint: 'rgba(245,158,11,0.10)',
    gradient: ['#78350F', '#B45309', '#F59E0B'] as const,
    nodeGradient: ['#78350F', '#F59E0B'] as const,
    emoji: '🏛️',
  },
  ocean: {
    name: 'Ocean',
    nameTR: 'Okyanus',
    difficulty: 'medium' as const,
    categoryName: 'Geography',
    icon: 'water',
    color: '#60A5FA',
    dimColor: 'rgba(96,165,250,0.22)',
    tint: 'rgba(96,165,250,0.10)',
    gradient: ['#1E3A8A', '#1D4ED8', '#60A5FA'] as const,
    nodeGradient: ['#1E3A8A', '#60A5FA'] as const,
    emoji: '🌊',
  },
  volcano: {
    name: 'Volcano',
    nameTR: 'Volkan',
    difficulty: 'hard' as const,
    categoryName: 'Technology',
    icon: 'flame',
    color: '#FB923C',
    dimColor: 'rgba(251,146,60,0.22)',
    tint: 'rgba(251,146,60,0.10)',
    gradient: ['#7C2D12', '#C2410C', '#FB923C'] as const,
    nodeGradient: ['#7C2D12', '#FB923C'] as const,
    emoji: '🌋',
  },
  cyber: {
    name: 'Cyber City',
    nameTR: 'Siber Şehir',
    difficulty: 'hard' as const,
    categoryName: 'Pop Culture',
    icon: 'hardware-chip',
    color: '#F471B5',
    dimColor: 'rgba(244,113,181,0.22)',
    tint: 'rgba(244,113,181,0.10)',
    gradient: ['#831843', '#BE185D', '#F471B5'] as const,
    nodeGradient: ['#831843', '#F471B5'] as const,
    emoji: '💻',
  },
} as const;

export type WorldKey = keyof typeof WORLD_THEMES;

export const WORLDS: Array<{ worldId: number; key: WorldKey; unlockAfterLevel: number }> = [
  { worldId: 1, key: 'jungle',  unlockAfterLevel: 0  },
  { worldId: 2, key: 'space',   unlockAfterLevel: 5  },
  { worldId: 3, key: 'ruins',   unlockAfterLevel: 10 },
  { worldId: 4, key: 'ocean',   unlockAfterLevel: 15 },
  { worldId: 5, key: 'volcano', unlockAfterLevel: 20 },
  { worldId: 6, key: 'cyber',   unlockAfterLevel: 25 },
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
