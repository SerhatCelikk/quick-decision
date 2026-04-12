import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root stack param list
export type RootStackParamList = {
  Main: undefined;
  Game: { categoryId: string; levelNumber?: number };
  LevelCompletion: {
    levelNumber: number;
    correct: number;
    total: number;
    passed: boolean;
    accuracy: number;
    nextLevel: number;
  };
};

// Bottom tab param list
export type TabParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TabScreenProps<T extends keyof TabParamList> = BottomTabScreenProps<TabParamList, T>;
