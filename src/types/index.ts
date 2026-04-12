export type {
  RootStackParamList,
  TabParamList,
  RootStackScreenProps,
  TabScreenProps,
} from './navigation';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  score: number;
  level: number;
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  categoryId: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface GameSession {
  id: string;
  userId: string;
  categoryId: string;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  startedAt: string;
  completedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
}
