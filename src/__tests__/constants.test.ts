/**
 * Tests for level config constants and helper functions.
 * Covers: getLevelConfig, LEVEL_CONFIG, PASS_THRESHOLD.
 */
import { getLevelConfig, LEVEL_CONFIG, PASS_THRESHOLD, COLORS } from '../constants';

describe('PASS_THRESHOLD', () => {
  it('is 0.75 (75%)', () => {
    expect(PASS_THRESHOLD).toBe(0.75);
  });
});

describe('getLevelConfig', () => {
  it('returns correct config for level 1', () => {
    const cfg = getLevelConfig(1);
    expect(cfg.level).toBe(1);
    expect(cfg.questionCount).toBe(5);
    expect(cfg.timerSeconds).toBe(10);
  });

  it('returns correct config for level 5', () => {
    const cfg = getLevelConfig(5);
    expect(cfg.level).toBe(5);
    expect(cfg.questionCount).toBe(10);
    expect(cfg.timerSeconds).toBe(8);
  });

  it('returns correct config for level 10 (hardest defined easy timer)', () => {
    const cfg = getLevelConfig(10);
    expect(cfg.level).toBe(10);
    expect(cfg.questionCount).toBe(12);
    expect(cfg.timerSeconds).toBe(5);
  });

  it('returns correct config for level 15', () => {
    const cfg = getLevelConfig(15);
    expect(cfg.level).toBe(15);
    expect(cfg.questionCount).toBe(15);
    expect(cfg.timerSeconds).toBe(4);
  });

  it('falls back to max config for levels beyond 15', () => {
    const cfg = getLevelConfig(99);
    expect(cfg.level).toBe(99);
    expect(cfg.questionCount).toBe(15);
    expect(cfg.timerSeconds).toBe(4);
  });

  it('covers all 15 defined levels', () => {
    for (let i = 1; i <= 15; i++) {
      const cfg = getLevelConfig(i);
      expect(cfg.level).toBe(i);
      expect(cfg.questionCount).toBeGreaterThan(0);
      expect(cfg.timerSeconds).toBeGreaterThan(0);
    }
  });

  it('difficulty increases with level number', () => {
    // Timer decreases as levels increase (harder = less time)
    const early = getLevelConfig(1);
    const mid = getLevelConfig(8);
    const late = getLevelConfig(15);
    expect(early.timerSeconds).toBeGreaterThanOrEqual(mid.timerSeconds);
    expect(mid.timerSeconds).toBeGreaterThanOrEqual(late.timerSeconds);
  });

  it('every level in LEVEL_CONFIG has valid structure', () => {
    for (const entry of LEVEL_CONFIG) {
      expect(entry.level).toBeGreaterThan(0);
      expect(entry.questionCount).toBeGreaterThan(0);
      expect(entry.timerSeconds).toBeGreaterThan(0);
    }
  });
});

describe('COLORS', () => {
  it('exports required color keys', () => {
    expect(COLORS.background).toBeDefined();
    expect(COLORS.surface).toBeDefined();
    expect(COLORS.primary).toBeDefined();
    expect(COLORS.text).toBeDefined();
    expect(COLORS.textMuted).toBeDefined();
    expect(COLORS.border).toBeDefined();
  });
});
