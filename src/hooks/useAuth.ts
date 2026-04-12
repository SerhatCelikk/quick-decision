import { useState } from 'react';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuth = (): AuthState => {
  // Loading starts false since Supabase is not yet integrated
  const [user] = useState<User | null>(null);
  const [loading] = useState(false);

  // TODO: integrate with Supabase auth — replace useState above with subscription

  return { user, loading };
};
