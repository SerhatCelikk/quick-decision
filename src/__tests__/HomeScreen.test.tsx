/**
 * Component tests for HomeScreen.
 * Verifies: loading state, level display, progress info, Play Now navigation.
 */

// Mock modules BEFORE imports — factory captures mock fns correctly at call time
jest.mock('../hooks/useLevelProgress', () => ({
  useLevelProgress: jest.fn(),
}));

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
import { HomeScreen } from '../screens/Home/HomeScreen';
import { useLevelProgress } from '../hooks/useLevelProgress';

const mockUseLevelProgress = useLevelProgress as jest.Mock;

const mockNavigate = jest.fn();

function buildProps() {
  return {
    navigation: {
      navigate: mockNavigate,
      goBack: jest.fn(),
      replace: jest.fn(),
    } as unknown as Parameters<typeof HomeScreen>[0]['navigation'],
    route: {} as unknown as Parameters<typeof HomeScreen>[0]['route'],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('HomeScreen', () => {
  it('shows app title', () => {
    mockUseLevelProgress.mockReturnValue({
      progress: null,
      loading: false,
      submitAttempt: jest.fn(),
      refresh: jest.fn(),
    });

    render(<HomeScreen {...buildProps()} />);
    expect(screen.getByText('Quick Decision')).toBeTruthy();
  });

  it('shows subtitle', () => {
    mockUseLevelProgress.mockReturnValue({
      progress: null,
      loading: false,
      submitAttempt: jest.fn(),
      refresh: jest.fn(),
    });

    render(<HomeScreen {...buildProps()} />);
    expect(screen.getByText('Test your speed and knowledge')).toBeTruthy();
  });

  it('shows "Play Now" button', () => {
    mockUseLevelProgress.mockReturnValue({
      progress: { current_level: 1, highest_level_unlocked: 1 },
      loading: false,
      submitAttempt: jest.fn(),
      refresh: jest.fn(),
    });

    render(<HomeScreen {...buildProps()} />);
    expect(screen.getByText('Play Now')).toBeTruthy();
  });

  it('displays current level from progress', () => {
    mockUseLevelProgress.mockReturnValue({
      progress: { current_level: 3, highest_level_unlocked: 5 },
      loading: false,
      submitAttempt: jest.fn(),
      refresh: jest.fn(),
    });

    render(<HomeScreen {...buildProps()} />);
    expect(screen.getByText('Level 3')).toBeTruthy();
  });

  it('shows highest unlocked level when above current', () => {
    mockUseLevelProgress.mockReturnValue({
      progress: { current_level: 2, highest_level_unlocked: 5 },
      loading: false,
      submitAttempt: jest.fn(),
      refresh: jest.fn(),
    });

    render(<HomeScreen {...buildProps()} />);
    expect(screen.getByText(/Up to Level 5 unlocked/)).toBeTruthy();
  });

  it('navigates to Game with current level when Play Now pressed', () => {
    mockUseLevelProgress.mockReturnValue({
      progress: { current_level: 4, highest_level_unlocked: 4 },
      loading: false,
      submitAttempt: jest.fn(),
      refresh: jest.fn(),
    });

    render(<HomeScreen {...buildProps()} />);
    fireEvent.press(screen.getByText('Play Now'));

    expect(mockNavigate).toHaveBeenCalledWith('Game', {
      categoryId: 'general',
      levelNumber: 4,
    });
  });

  it('defaults to level 1 when progress is null', () => {
    mockUseLevelProgress.mockReturnValue({
      progress: null,
      loading: false,
      submitAttempt: jest.fn(),
      refresh: jest.fn(),
    });

    render(<HomeScreen {...buildProps()} />);
    fireEvent.press(screen.getByText('Play Now'));

    expect(mockNavigate).toHaveBeenCalledWith('Game', {
      categoryId: 'general',
      levelNumber: 1,
    });
  });

  it('shows pass threshold info text', () => {
    mockUseLevelProgress.mockReturnValue({
      progress: { current_level: 1, highest_level_unlocked: 1 },
      loading: false,
      submitAttempt: jest.fn(),
      refresh: jest.fn(),
    });

    render(<HomeScreen {...buildProps()} />);
    expect(screen.getByText(/75%/)).toBeTruthy();
  });

  it('shows frontier message when on highest unlocked level', () => {
    mockUseLevelProgress.mockReturnValue({
      progress: { current_level: 3, highest_level_unlocked: 3 },
      loading: false,
      submitAttempt: jest.fn(),
      refresh: jest.fn(),
    });

    render(<HomeScreen {...buildProps()} />);
    expect(screen.getByText(/frontier/i)).toBeTruthy();
  });
});
