'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const isExpired = useAuthStore((state) => state.isExpired);
  const [isHydrated, setIsHydrated] = useState(false);
  const initialized = useRef(false);

  // hydration 체크
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || initialized.current) return;
    initialized.current = true;

    // 만료 체크
    if (user && isExpired()) {
      clearUser();
      supabase.auth.signOut();
      return;
    }

    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (!user || user.id !== session.user.id) {
          setUser(session.user);
        }
      } else if (user) {
        clearUser();
      }
    });

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        clearUser();
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  // 카카오 로그인
  const signInWithKakao = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  }, []);

  // 로그아웃
  const signOut = useCallback(async () => {
    clearUser();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [clearUser]);

  return {
    user,
    loading: !isHydrated,
    signInWithKakao,
    signOut,
  };
}
