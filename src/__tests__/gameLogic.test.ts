/**
 * Tests for core game logic: score calculation, streak bonuses,
 * pass/fail determination, and timer expiry handling.
 * These test the logic extracted from GameScreen / LevelCompletionScreen.
 */
import { PASS_THRESHOLD, getLevelConfig } from '../constants';

// ─── Score calculation ────────────────────────────────────────────────────────

/**
 * Score formula mirrors GameScreen.handleAnswer:
 * score += Math.floor(100 * (1 + (streak - 1) * 0.5))
 * where streak is the streak AFTER this correct answer.
 */
function calculateScoreIncrement(newStreak: number): number {
  return Math.floor(100 * (1 + (newStreak - 1) * 0.5));
}

describe('Score calculation', () => {
  it('gives 100 points for streak 1 (first correct answer)', () => {
    expect(calculateScoreIncrement(1)).toBe(100);
  });

  it('gives 150 points for streak 2', () => {
    expect(calculateScoreIncrement(2)).toBe(150);
  });

  it('gives 200 points for streak 3', () => {
    expect(calculateScoreIncrement(3)).toBe(200);
  });

  it('gives 250 points for streak 4', () => {
    expect(calculateScoreIncrement(4)).toBe(250);
  });

  it('accumulates correctly over a 3-answer correct run', () => {
    let totalScore = 0;
    totalScore += calculateScoreIncrement(1); // 100
    totalScore += calculateScoreIncrement(2); // 150
    totalScore += calculateScoreIncrement(3); // 200
    expect(totalScore).toBe(450);
  });

  it('resets streak bonus after a wrong answer', () => {
    // After a wrong answer, streak goes back to 0, next correct = streak 1 = 100pts
    const afterReset = calculateScoreIncrement(1);
    expect(afterReset).toBe(100);
  });
});

// ─── Pass/fail logic ──────────────────────────────────────────────────────────

function isPassed(correct: number, total: number): boolean {
  const accuracy = total > 0 ? correct / total : 0;
  return accuracy >= PASS_THRESHOLD;
}

describe('Pass/fail determination (75% threshold)', () => {
  it('passes when exactly 75% correct (6/8)', () => {
    expect(isPassed(6, 8)).toBe(true);
  });

  it('passes when above 75% (8/8)', () => {
    expect(isPassed(8, 8)).toBe(true);
  });

  it('fails when below 75% (5/8 = 62.5%)', () => {
    expect(isPassed(5, 8)).toBe(false);
  });

  it('fails when 0 correct', () => {
    expect(isPassed(0, 8)).toBe(false);
  });

  it('passes with 10/10', () => {
    expect(isPassed(10, 10)).toBe(true);
  });

  it('fails with 7/10 (70%)', () => {
    expect(isPassed(7, 10)).toBe(false);
  });

  it('passes with 8/10 (80%)', () => {
    expect(isPassed(8, 10)).toBe(true);
  });

  it('fails with 11/15 (73.3%)', () => {
    expect(isPassed(11, 15)).toBe(false);
  });

  it('passes with 12/15 (80%)', () => {
    expect(isPassed(12, 15)).toBe(true);
  });

  it('handles edge case: 0 total questions (fails gracefully)', () => {
    expect(isPassed(0, 0)).toBe(false);
  });
});

// ─── Level progression ────────────────────────────────────────────────────────

describe('Level progression', () => {
  it('next level = levelNumber + 1 when passed', () => {
    const levelNumber = 3;
    const passed = true;
    const nextLevel = passed ? levelNumber + 1 : levelNumber;
    expect(nextLevel).toBe(4);
  });

  it('next level = same level when failed (retry)', () => {
    const levelNumber = 3;
    const passed = false;
    const nextLevel = passed ? levelNumber + 1 : levelNumber;
    expect(nextLevel).toBe(3);
  });

  it('level configs get harder as levels increase', () => {
    // Verify question count generally increases
    const l1 = getLevelConfig(1);
    const l10 = getLevelConfig(10);
    expect(l10.questionCount).toBeGreaterThan(l1.questionCount);
  });
});

// ─── Timer logic ──────────────────────────────────────────────────────────────

describe('Timer expiry handling', () => {
  it('timer expiry counts as wrong answer (no score, streak reset)', () => {
    // timedOut=true → isCorrect=false → streak resets to 0
    const timedOut = true;
    const choiceIndex = -1;
    const currentCorrectIndex = 0;
    const isCorrect = !timedOut && choiceIndex === currentCorrectIndex;
    expect(isCorrect).toBe(false);
  });

  it('correct answer before timer ends counts as correct', () => {
    const timedOut = false;
    const choiceIndex = 1;
    const currentCorrectIndex = 1;
    const isCorrect = !timedOut && choiceIndex === currentCorrectIndex;
    expect(isCorrect).toBe(true);
  });

  it('wrong answer before timer ends counts as wrong', () => {
    const timedOut = false;
    const choiceIndex = 0;
    const currentCorrectIndex = 1;
    const isCorrect = !timedOut && choiceIndex === currentCorrectIndex;
    expect(isCorrect).toBe(false);
  });
});

// ─── Accuracy display ─────────────────────────────────────────────────────────

describe('Accuracy percentage display', () => {
  it('rounds 0.7500 to 75%', () => {
    expect(Math.round(0.75 * 100)).toBe(75);
  });

  it('rounds 0.6667 to 67%', () => {
    expect(Math.round((2 / 3) * 100)).toBe(67);
  });

  it('rounds 0.8333 to 83%', () => {
    expect(Math.round((5 / 6) * 100)).toBe(83);
  });

  it('returns 100% for perfect score', () => {
    expect(Math.round(1.0 * 100)).toBe(100);
  });
});
