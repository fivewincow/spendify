'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 에러 파라미터 체크
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);

        const error = searchParams.get('error') || hashParams.get('error');
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description');

        if (error) {
          router.replace(`/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || '로그인에 실패했습니다.')}`);
          return;
        }

        // 세션 가져오기 (hash fragment의 토큰을 supabase가 자동 처리)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          router.replace(`/login?error=session_error&message=${encodeURIComponent(sessionError.message)}`);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          router.replace('/');
        } else {
          router.replace('/login?error=no_session&message=세션을 가져올 수 없습니다.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        router.replace('/login?error=unknown&message=알 수 없는 오류가 발생했습니다.');
      }
    };

    handleCallback();
  }, [router, setUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      <p className="mt-4 text-gray-600">로그인 처리 중...</p>
    </div>
  );
}
