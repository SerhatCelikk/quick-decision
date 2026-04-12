/**
 * Component tests for LevelCompletionScreen.
 * Verifies: pass/fail display, accuracy stats, CTA buttons, navigation.
 */

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { LevelCompletionScreen } from '../screens/LevelCompletion/LevelCompletionScreen';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();

function buildProps(overrides?: Partial<{
  levelNumber: number;
  correct: number;
  total: number;
  passed: boolean;
  accuracy: number;
  nextLevel: number;
}>) {
  const defaults = {
    levelNumber: 3,
    correct: 6,
    total: 8,
    passed: true,
    accuracy: 0.75,
    nextLevel: 4,
    ...overrides,
  };
  return {
    navigation: {
      replace: mockReplace,
      navigate: mockNavigate,
      goBack: jest.fn(),
    } as unknown as Parameters<typeof LevelCompletionScreen>[0]['navigation'],
    route: {
      params: defaults,
    } as unknown as Parameters<typeof LevelCompletionScreen>[0]['route'],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('LevelCompletionScreen — passed', () => {
  it('shows "Level Complete!" when passed', () => {
    render(<LevelCompletionScreen {...buildProps({ passed: true })} />);
    expect(screen.getByText('Level Complete!')).toBeTruthy();
  });

  it('shows level badge with correct level number', () => {
    render(<LevelCompletionScreen {...buildProps({ levelNumber: 5, passed: true })} />);
    expect(screen.getByText('Level 5')).toBeTruthy();
  });

  it('shows correct/total stat', () => {
    render(<LevelCompletionScreen {...buildProps({ correct: 6, total: 8, passed: true })} />);
    expect(screen.getByText('6 / 8')).toBeTruthy();
  });

  it('shows accuracy percentage', () => {
    render(<LevelCompletionScreen {...buildProps({ accuracy: 0.75, passed: true })} />);
    expect(screen.getByText('75%')).toBeTruthy();
  });

  it('shows next level when passed', () => {
    render(<LevelCompletionScreen {...buildProps({ passed: true, nextLevel: 4 })} />);
    expect(screen.getByText('Lv 4')).toBeTruthy();
  });

  it('pressing "Next Level" navigates to next level game', () => {
    render(<LevelCompletionScreen {...buildProps({ passed: true, levelNumber: 3, nextLevel: 4 })} />);
    fireEvent.press(screen.getByText('Next Level →'));
    expect(mockReplace).toHaveBeenCalledWith('Game', {
      categoryId: 'general',
      levelNumber: 4,
    });
  });

  it('pressing "Home" navigates to Main', () => {
    render(<LevelCompletionScreen {...buildProps({ passed: true })} />);
    fireEvent.press(screen.getByText('Home'));
    expect(mockNavigate).toHaveBeenCalledWith('Main');
  });
});

describe('LevelCompletionScreen — failed', () => {
  it('shows "So Close!" when failed', () => {
    render(
      <LevelCompletionScreen
        {...buildProps({ passed: false, correct: 5, total: 8, accuracy: 0.625 })}
      />
    );
    expect(screen.getByText('So Close!')).toBeTruthy();
  });

  it('shows retry level when failed', () => {
    render(
      <LevelCompletionScreen
        {...buildProps({ passed: false, levelNumber: 3, nextLevel: 3, accuracy: 0.5 })}
      />
    );
    expect(screen.getByText('Lv 3')).toBeTruthy();
  });

  it('pressing "Try Again" replaces with same level', () => {
    render(
      <LevelCompletionScreen
        {...buildProps({ passed: false, levelNumber: 3, nextLevel: 3, accuracy: 0.5 })}
      />
    );
    fireEvent.press(screen.getByText('Try Again'));
    expect(mockReplace).toHaveBeenCalledWith('Game', {
      categoryId: 'general',
      levelNumber: 3,
    });
  });

  it('shows failure accuracy message with threshold', () => {
    render(
      <LevelCompletionScreen
        {...buildProps({ passed: false, accuracy: 0.625, correct: 5, total: 8 })}
      />
    );
    // Multiple elements may contain "75%" (subtitle and bar label); use getAllByText
    const matches = screen.getAllByText(/75%/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('shows accuracy percentage for failed attempt', () => {
    render(
      <LevelCompletionScreen
        {...buildProps({ passed: false, accuracy: 0.625, correct: 5, total: 8 })}
      />
    );
    expect(screen.getByText('63%')).toBeTruthy();
  });
});

describe('LevelCompletionScreen — edge cases', () => {
  it('handles perfect score 100%', () => {
    render(
      <LevelCompletionScreen
        {...buildProps({ passed: true, correct: 10, total: 10, accuracy: 1.0, nextLevel: 2 })}
      />
    );
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('handles zero correct answers', () => {
    render(
      <LevelCompletionScreen
        {...buildProps({ passed: false, correct: 0, total: 8, accuracy: 0.0 })}
      />
    );
    expect(screen.getByText('0 / 8')).toBeTruthy();
    expect(screen.getByText('0%')).toBeTruthy();
  });
});
