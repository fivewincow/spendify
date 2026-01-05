'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Transaction, SortOption, ViewMode, DateFilter } from '@/types/transaction';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import {
  TransactionList,
  TransactionForm,
  TransactionDetail,
  TransactionSummary,
  DateFilterSelector,
  FilterBar,
  CalendarView,
  ViewModeTab,
  PageViewMode,
} from '@/components/transactions';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, LogOut, Pin } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  const today = new Date();
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    type: 'month',
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [pageViewMode, setPageViewModeState] = useState<PageViewMode>('calendar');

  // 캘린더 뷰로 변경 시 월별 필터로 강제 변경
  const setPageViewMode = (mode: PageViewMode) => {
    if (mode === 'calendar' && dateFilter.type !== 'month') {
      setDateFilter({
        type: 'month',
        year: today.getFullYear(),
        month: today.getMonth() + 1,
      });
    }
    setPageViewModeState(mode);
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const { data: transactions = [], isLoading, error } = useTransactions({
    dateFilter,
    sortBy,
  });

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  // 인증 로딩 중이거나 유저가 없으면 로딩 표시
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  function handleItemClick(transaction: Transaction) {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  }

  function handleEdit(transaction: Transaction) {
    setIsDetailOpen(false);
    setEditTransaction(transaction);
    setIsFormOpen(true);
  }

  function handleFormClose() {
    setIsFormOpen(false);
    setEditTransaction(null);
  }

  function handleDetailClose() {
    setIsDetailOpen(false);
    setSelectedTransaction(null);
  }

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Spendify</h1>
            <div className="flex items-center gap-1">
              <Link href="/recurring">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  title="고정 수입/지출"
                >
                  <Pin className="w-3 h-3" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-9 w-9"
                title="로그아웃"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* View Mode Tab */}
          <div className="mb-3">
            <ViewModeTab mode={pageViewMode} onChange={setPageViewMode} />
          </div>

          {/* Date Filter - 캘린더 모드에서는 월별만 표시 */}
          {pageViewMode === 'calendar' ? (
            <DateFilterSelector
              filter={{ type: 'month', year: dateFilter.year || today.getFullYear(), month: dateFilter.month || today.getMonth() + 1 }}
              onChange={(filter) => setDateFilter({ ...filter, type: 'month' })}
            />
          ) : (
            <DateFilterSelector
              filter={dateFilter}
              onChange={setDateFilter}
            />
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Summary */}
        <TransactionSummary
          transactions={transactions}
          dateFilter={dateFilter}
        />

        {/* 리스트 뷰 */}
        {pageViewMode === 'list' && (
          <>
            {/* Filter Bar */}
            <div className="mt-4">
              <FilterBar
                sortBy={sortBy}
                viewMode={viewMode}
                onSortChange={setSortBy}
                onViewModeChange={setViewMode}
                onAddClick={() => setIsFormOpen(true)}
              />
            </div>

            {/* Transaction List */}
            <div className="mt-4">
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
                <TransactionList
                  transactions={transactions}
                  viewMode={viewMode}
                  onItemClick={handleItemClick}
                />
              )}
            </div>
          </>
        )}

        {/* 캘린더 뷰 */}
        {pageViewMode === 'calendar' && (
          <div className="mt-4">
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
              <CalendarView
                transactions={transactions}
                year={dateFilter.year || today.getFullYear()}
                month={dateFilter.month || today.getMonth() + 1}
                onItemClick={handleItemClick}
              />
            )}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <Button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        editTransaction={editTransaction}
      />

      {/* Detail Modal */}
      <TransactionDetail
        transaction={selectedTransaction}
        isOpen={isDetailOpen}
        onClose={handleDetailClose}
        onEdit={handleEdit}
      />
    </main>
  );
}
