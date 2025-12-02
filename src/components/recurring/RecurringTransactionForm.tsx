'use client';

import { useState, useEffect } from 'react';
import {
  RecurringTransaction,
  RecurringTransactionFormData,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '@/types/transaction';
import {
  useCreateRecurringTransaction,
  useUpdateRecurringTransaction,
} from '@/hooks/useRecurringTransactions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface RecurringTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: RecurringTransaction | null;
}

export function RecurringTransactionForm({
  isOpen,
  onClose,
  editTransaction,
}: RecurringTransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [content, setContent] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [memo, setMemo] = useState('');

  const createMutation = useCreateRecurringTransaction();
  const updateMutation = useUpdateRecurringTransaction();

  const isEditing = !!editTransaction;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  // 편집 모드일 때 폼 초기화
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setContent(editTransaction.content);
      setAmount(String(editTransaction.amount));
      setCategory(editTransaction.category);
      setDayOfMonth(String(editTransaction.day_of_month));
      setMemo(editTransaction.memo || '');
    } else {
      resetForm();
    }
  }, [editTransaction, isOpen]);

  function resetForm() {
    setType('expense');
    setContent('');
    setAmount('');
    setCategory('');
    setDayOfMonth('1');
    setMemo('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData: RecurringTransactionFormData = {
      type,
      content,
      amount: Number(amount),
      category: category || '기타',
      day_of_month: Number(dayOfMonth),
      memo: memo || undefined,
    };

    try {
      if (isEditing && editTransaction) {
        await updateMutation.mutateAsync({ id: editTransaction.id, ...formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to save recurring transaction:', error);
    }
  }

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '고정 내역 수정' : '고정 내역 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex rounded-lg overflow-hidden border">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
              }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                type === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              고정 지출
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('');
              }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                type === 'income'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              고정 수입
            </button>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <input
              id="content"
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="예: 클로드 구독, 월급"
              className="w-full h-10 px-3 border rounded-md"
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">금액</Label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full h-10 px-3 border rounded-md"
              min="1"
              required
            />
          </div>

          {/* Day of Month */}
          <div className="space-y-2">
            <Label htmlFor="dayOfMonth">매월 결제일</Label>
            <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
              <SelectTrigger>
                <SelectValue placeholder="결제일 선택" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={String(day)}>
                    매월 {day}일
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모 (선택)</Label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              className="w-full h-20 px-3 py-2 border rounded-md resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !content || !amount}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                '수정'
              ) : (
                '추가'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
