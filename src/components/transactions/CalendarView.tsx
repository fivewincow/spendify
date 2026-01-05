'use client';

import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Transaction, EXPENSE_CATEGORIES } from '@/types/transaction';
import { formatCurrency } from '@/lib/format';
import { useCreateTransaction } from '@/hooks/useTransactions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface CalendarViewProps {
  transactions: Transaction[];
  year: number;
  month: number;
  onItemClick: (transaction: Transaction) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function CalendarView({ transactions, year, month, onItemClick }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);

  // 입력 폼 상태
  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const createTransaction = useCreateTransaction();

  // 해당 월의 날짜들
  const days = useMemo(() => {
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    return eachDayOfInterval({ start, end });
  }, [year, month]);

  // 시작 요일에 맞춰 빈 칸 추가
  const startDayOfWeek = getDay(days[0]);

  // 날짜별 거래 내역 그룹핑
  const transactionsByDate = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    transactions.forEach((t) => {
      const dateKey = t.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(t);
    });
    return grouped;
  }, [transactions]);

  // 날짜별 합계 계산
  const getDaySummary = (dateKey: string) => {
    const dayTransactions = transactionsByDate[dateKey] || [];
    const income = dayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, count: dayTransactions.length };
  };

  // 선택된 날짜의 거래 내역
  const selectedDateTransactions = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return transactionsByDate[dateKey] || [];
  }, [selectedDate, transactionsByDate]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsDayDialogOpen(true);
    setShowForm(false);
    setNewContent('');
    setNewAmount('');
  };

  const handleAddTransaction = async () => {
    if (!selectedDate || !newContent.trim() || !newAmount) return;

    const amount = parseInt(newAmount.replace(/,/g, ''), 10);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await createTransaction.mutateAsync({
        type: 'expense',
        date: format(selectedDate, 'yyyy-MM-dd'),
        content: newContent.trim(),
        amount,
        category: EXPENSE_CATEGORIES[0],
      });
      setNewContent('');
      setNewAmount('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleAmountChange = (value: string) => {
    // 숫자만 허용하고 콤마 포맷팅
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue) {
      setNewAmount(parseInt(numericValue, 10).toLocaleString('ko-KR'));
    } else {
      setNewAmount('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={`text-center text-xs font-medium py-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-0.5 bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
        {/* 시작 요일 전 빈 칸 */}
        {Array.from({ length: startDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square bg-gray-50" />
        ))}

        {/* 날짜 칸들 */}
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const { income, expense, count } = getDaySummary(dateKey);
          const dayOfWeek = getDay(day);
          const isToday = isSameDay(day, new Date());
          const total = expense - income; // 지출 - 수입 (양수면 지출이 많음)

          return (
            <button
              key={dateKey}
              onClick={() => handleDayClick(day)}
              className={`aspect-square p-1 text-left flex flex-col hover:bg-gray-100 transition-colors ${
                isToday ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : 'bg-white'
              }`}
            >
              <span
                className={`text-xs font-medium ${
                  dayOfWeek === 0
                    ? 'text-red-500'
                    : dayOfWeek === 6
                    ? 'text-blue-500'
                    : 'text-gray-900'
                }`}
              >
                {format(day, 'd')}
              </span>
              {count > 0 && (
                <div className="flex-1 flex flex-col justify-end">
                  <span
                    className={`text-[10px] font-semibold text-right ${
                      total > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {total > 0 ? '-' : '+'}{formatCurrency(Math.abs(total))}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 날짜별 상세 다이얼로그 */}
      <Dialog open={isDayDialogOpen} onOpenChange={setIsDayDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
            </DialogTitle>
          </DialogHeader>

          {/* 거래 내역 목록 */}
          <div className="space-y-2 py-2">
            {selectedDateTransactions.length === 0 && !showForm ? (
              <p className="text-center text-gray-500 py-8">이날의 일정이 없습니다</p>
            ) : (
              selectedDateTransactions.map((transaction) => (
                <button
                  key={transaction.id}
                  onClick={() => {
                    setIsDayDialogOpen(false);
                    onItemClick(transaction);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left ${
                    transaction.is_recurring ? 'border border-dashed border-gray-300' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      {transaction.is_recurring && (
                        <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">고정</span>
                      )}
                      <p className="font-medium text-gray-900 truncate">{transaction.content}</p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ml-2 ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* 합계 표시 */}
          {selectedDateTransactions.length > 0 && (
            <div className="border-t pt-3 mt-2">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-gray-700">합계</span>
                <span className="text-red-600">
                  -{formatCurrency(
                    selectedDateTransactions
                      .filter((t) => t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0) -
                    selectedDateTransactions
                      .filter((t) => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </span>
              </div>
            </div>
          )}

          {/* 입력 폼 */}
          {showForm && (
            <div className="border-t pt-4 mt-2 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="내용"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="금액"
                  value={newAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-28 text-right"
                  inputMode="numeric"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setNewContent('');
                    setNewAmount('');
                  }}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddTransaction}
                  disabled={!newContent.trim() || !newAmount || createTransaction.isPending}
                >
                  {createTransaction.isPending ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          )}

          {/* + 버튼 */}
          {!showForm && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setShowForm(true)}
                className="h-12 w-12 rounded-full"
                size="icon"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
