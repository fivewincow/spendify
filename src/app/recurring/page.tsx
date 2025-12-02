'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { RecurringTransaction } from '@/types/transaction';
import {
  RecurringTransactionForm,
  RecurringTransactionList,
} from '@/components/recurring';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';

export default function RecurringPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { data: transactions = [], isLoading, error } = useRecurringTransactions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<RecurringTransaction | null>(null);

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // 인증 로딩 중이거나 유저가 없으면 로딩 표시
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  function handleEdit(transaction: RecurringTransaction) {
    setEditTransaction(transaction);
    setIsFormOpen(true);
  }

  function handleFormClose() {
    setIsFormOpen(false);
    setEditTransaction(null);
  }

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-9 w-9"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">고정 수입/지출</h1>
            </div>
            <Button size="sm" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-500">
            <p>데이터를 불러오는데 실패했습니다</p>
            <p className="text-sm mt-1">다시 시도해주세요</p>
          </div>
        ) : (
          <RecurringTransactionList
            transactions={transactions}
            onEdit={handleEdit}
          />
        )}
      </div>

      {/* Form Modal */}
      <RecurringTransactionForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editTransaction={editTransaction}
      />
    </main>
  );
}
