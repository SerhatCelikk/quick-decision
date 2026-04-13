import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Root stack param list
export type RootStackParamList = {
  Main: undefined;
  LevelMap: { worldId: number; worldName: string; worldColor: string };
  Game: { worldId: number; worldLevelNumber: number; levelNumber: number; categoryId: string };
  LevelCompletion: {
    worldId: number;
    worldLevelNumber: number;
    levelNumber: number;
    correct: number;
    total: number;
    passed: boolean;
    accuracy: number;
    stars: 0 | 1 | 2 | 3;
    nextLevel: number;
    energyRemaining: number;
  };
  Friends: undefined;
  Challenges: undefined;
  ShareCard: undefined;
  // v1.1 screens
  Achievements: undefined;
  SeasonalEvent: { eventId: string; eventTitle: string };
  Paywall: { source?: string };
  MultiplayerLobby: undefined;
  Matchmaking: undefined;
  LiveBattle: { matchId: string; opponentUsername: string };
  BattleResults: { matchId: string; won: boolean; myScore: number; opponentScore: number; opponentUsername: string };
  Referral: undefined;
};

// Bottom tab param list — Home tab now renders WorldMapScreen
export type TabParamList = {
  WorldMap: undefined;
  Leaderboard: undefined;
  Social: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
