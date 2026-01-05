'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, signInWithKakao } = useAuth();
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // URL에서 에러 파라미터 체크
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error) {
      setErrorMessage(message || '로그인에 실패했습니다.');
      setErrorDialogOpen(true);
      // URL에서 에러 파라미터 제거
      router.replace('/login');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const handleKakaoLogin = async () => {
    try {
      await signInWithKakao();
    } catch (error) {
      setErrorMessage('카카오 로그인을 시작할 수 없습니다.');
      setErrorDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Spendify</h1>
          <p className="mt-2 text-gray-600">개인 가계부</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleKakaoLogin}
            className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD800] text-[#000000] font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 3C6.477 3 2 6.477 2 11c0 2.89 1.804 5.42 4.5 6.764-.195.732-.704 2.654-.808 3.073-.13.525.192.518.404.377.166-.11 2.638-1.79 3.71-2.519.7.104 1.425.155 2.194.155 5.523 0 10-3.477 10-8s-4.477-8-10-8z" />
            </svg>
            카카오 로그인
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500">
          로그인하면 서비스 이용약관에 동의하게 됩니다.
        </p>
      </div>

      {/* 에러 다이얼로그 */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>로그인 실패</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setErrorDialogOpen(false)}>확인</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
