import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  expiresAt: number | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  isExpired: () => boolean;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 1일 (밀리초)

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      expiresAt: null,

      setUser: (user: User | null) => {
        set({
          user,
          expiresAt: user ? Date.now() + ONE_DAY_MS : null,
        });
      },

      clearUser: () => {
        set({ user: null, expiresAt: null });
      },

      isExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return true;
        return Date.now() > expiresAt;
      },
    }),
    {
      name: 'spendify-auth',
    }
  )
);
