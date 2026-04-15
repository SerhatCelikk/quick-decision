/**
 * Auto-generated Supabase TypeScript types for the Quick Decision Game.
 * Regenerate with: npx supabase gen types typescript --local > src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          username: string;
          avatar_url: string | null;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          username: string;
          avatar_url?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          username?: string;
          avatar_url?: string | null;
          is_anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          category_id: string;
          text: string;
          correct_answer: string;
          wrong_answer: string;
          difficulty: 'easy' | 'medium' | 'hard';
          language: 'en' | 'tr';
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          text: string;
          correct_answer: string;
          wrong_answer: string;
          difficulty: 'easy' | 'medium' | 'hard';
          language?: 'en' | 'tr';
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          text?: string;
          correct_answer?: string;
          wrong_answer?: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          language?: 'en' | 'tr';
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'questions_category_id_fkey';
            columns: ['category_id'];
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          }
        ];
      };
      levels: {
        Row: {
          id: number;
          level_number: number;
          question_count: number;
          timer_seconds: number;
          difficulty_weight: number;
          created_at: string;
        };
        Insert: {
          id: number;
          level_number: number;
          question_count: number;
          timer_seconds: number;
          difficulty_weight: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          level_number?: number;
          question_count?: number;
          timer_seconds?: number;
          difficulty_weight?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          current_level: number;
          highest_level_unlocked: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_level?: number;
          highest_level_unlocked?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_level?: number;
          highest_level_unlocked?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_progress_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      level_attempts: {
        Row: {
          id: string;
          user_id: string;
          level_number: number;
          questions_total: number;
          questions_correct: number;
          accuracy: number;
          passed: boolean;
          attempted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          level_number: number;
          questions_total: number;
          questions_correct: number;
          accuracy: number;
          passed: boolean;
          attempted_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          level_number?: number;
          questions_total?: number;
          questions_correct?: number;
          accuracy?: number;
          passed?: boolean;
          attempted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'level_attempts_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      scores: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          score: number;
          streak: number;
          category_id: string | null;
          questions_answered: number;
          questions_correct: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string;
          score: number;
          streak?: number;
          category_id?: string | null;
          questions_answered?: number;
          questions_correct?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          score?: number;
          streak?: number;
          category_id?: string | null;
          questions_answered?: number;
          questions_correct?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scores_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'scores_category_id_fkey';
            columns: ['category_id'];
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          }
        ];
      };
      share_codes: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'share_codes_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      friendships: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          status: 'pending' | 'accepted';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          status?: 'pending' | 'accepted';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          friend_id?: string;
          status?: 'pending' | 'accepted';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'friendships_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'friendships_friend_id_fkey';
            columns: ['friend_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      challenges: {
        Row: {
          id: string;
          challenger_id: string;
          challenged_id: string;
          level_id: number;
          challenger_score: number;
          challenged_score: number | null;
          status: 'pending' | 'completed' | 'expired';
          created_at: string;
        };
        Insert: {
          id?: string;
          challenger_id: string;
          challenged_id: string;
          level_id: number;
          challenger_score: number;
          challenged_score?: number | null;
          status?: 'pending' | 'completed' | 'expired';
          created_at?: string;
        };
        Update: {
          id?: string;
          challenger_id?: string;
          challenged_id?: string;
          level_id?: number;
          challenger_score?: number;
          challenged_score?: number | null;
          status?: 'pending' | 'completed' | 'expired';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'challenges_challenger_id_fkey';
            columns: ['challenger_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'challenges_challenged_id_fkey';
            columns: ['challenged_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      daily_challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          level_id: number;
          target_score: number;
          participants: number | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          level_id: number;
          target_score: number;
          participants?: number | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          level_id?: number;
          target_score?: number;
          participants?: number | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      level_progress: {
        Row: {
          id: string;
          user_id: string;
          current_level: number;
          highest_level_unlocked: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_level?: number;
          highest_level_unlocked?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_level?: number;
          highest_level_unlocked?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'level_progress_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      // v1.1 tables
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_key: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_key: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_key?: string;
          unlocked_at?: string;
        };
        Relationships: [];
      };
      seasonal_event_progress: {
        Row: {
          id: string;
          user_id: string;
          event_key: string;
          questions_answered: number;
          correct_answers: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_key: string;
          questions_answered?: number;
          correct_answers?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_key?: string;
          questions_answered?: number;
          correct_answers?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      multiplayer_stats: {
        Row: {
          id: string;
          user_id: string;
          elo: number;
          wins: number;
          losses: number;
          win_streak: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          elo?: number;
          wins?: number;
          losses?: number;
          win_streak?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          elo?: number;
          wins?: number;
          losses?: number;
          win_streak?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      multiplayer_matches: {
        Row: {
          id: string;
          user_id: string;
          opponent_id: string;
          opponent_username: string;
          result: 'win' | 'loss' | 'draw';
          elo_change: number;
          my_score: number;
          opponent_score: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          opponent_id: string;
          opponent_username: string;
          result: 'win' | 'loss' | 'draw';
          elo_change?: number;
          my_score?: number;
          opponent_score?: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          opponent_id?: string;
          opponent_username?: string;
          result?: 'win' | 'loss' | 'draw';
          elo_change?: number;
          my_score?: number;
          opponent_score?: number;
          completed_at?: string;
        };
        Relationships: [];
      };
      battle_questions: {
        Row: {
          id: string;
          match_id: string;
          text: string;
          options: string[];
          correct_index: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          match_id: string;
          text: string;
          options: string[];
          correct_index: number;
          sort_order?: number;
        };
        Update: {
          id?: string;
          match_id?: string;
          text?: string;
          options?: string[];
          correct_index?: number;
          sort_order?: number;
        };
        Relationships: [];
      };
      referrals: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          successful_referrals: number;
          pending_referrals: number;
          coins_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: string;
          successful_referrals?: number;
          pending_referrals?: number;
          coins_earned?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: string;
          successful_referrals?: number;
          pending_referrals?: number;
          coins_earned?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      submit_level_attempt: {
        Args: {
          p_level_number: number;
          p_questions_correct: number;
          p_questions_total: number;
        };
        Returns: {
          passed: boolean;
          accuracy: number;
          next_level: number;
        };
      };
      get_user_progress: {
        Args: Record<string, never>;
        Returns: {
          current_level: number;
          highest_level_unlocked: number;
        };
      };
      join_matchmaking: {
        Args: { p_user_id: string };
        Returns: null;
      };
      leave_matchmaking: {
        Args: { p_user_id: string };
        Returns: null;
      };
    };
    Enums: {
      difficulty_level: 'easy' | 'medium' | 'hard';
    };
  };
}

// Convenience row types
export type UserRow = Database['public']['Tables']['users']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type QuestionRow = Database['public']['Tables']['questions']['Row'];
export type LevelRow = Database['public']['Tables']['levels']['Row'];
export type ScoreRow = Database['public']['Tables']['scores']['Row'];
export type UserProgressRow = Database['public']['Tables']['user_progress']['Row'];
export type LevelAttemptRow = Database['public']['Tables']['level_attempts']['Row'];

// Convenience RPC return types
export type SubmitLevelAttemptResult = Database['public']['Functions']['submit_level_attempt']['Returns'];
export type GetUserProgressResult = Database['public']['Functions']['get_user_progress']['Returns'];
