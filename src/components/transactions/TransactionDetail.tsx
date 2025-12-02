'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDateWithDay } from '@/lib/format';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { ArrowDownCircle, ArrowUpCircle, Trash2, Edit, Loader2, Pin, Settings } from 'lucide-react';

interface TransactionDetailProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionDetail({
  transaction,
  isOpen,
  onClose,
  onEdit,
}: TransactionDetailProps) {
  const router = useRouter();
  const deleteMutation = useDeleteTransaction();

  if (!transaction) return null;

  const isExpense = transaction.type === 'expense';
  const isRecurring = transaction.is_recurring;

  async function handleDelete() {
    if (!transaction) return;

    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteMutation.mutateAsync(transaction.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  }

  function handleEdit() {
    if (transaction) {
      onEdit(transaction);
    }
  }

  function handleGoToRecurring() {
    onClose();
    router.push('/recurring');
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={`p-2 rounded-full ${
                isExpense ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              }`}
            >
              {isExpense ? (
                <ArrowDownCircle className="w-5 h-5" />
              ) : (
                <ArrowUpCircle className="w-5 h-5" />
              )}
            </div>
            <span>{isExpense ? '지출' : '수입'} 상세</span>
            {isRecurring && (
              <span className="flex items-center gap-0.5 text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded">
                <Pin className="w-3 h-3" />
                고정
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* Amount */}
          <div className="text-center">
            <p
              className={`text-3xl font-bold ${
                isExpense ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {isExpense ? '-' : '+'}
              {formatCurrency(transaction.amount)}원
            </p>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-3 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-gray-500">내용</span>
              <span className="font-medium">{transaction.content}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">날짜</span>
              <span className="font-medium">{formatDateWithDay(transaction.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">카테고리</span>
              <span className="font-medium">{transaction.category}</span>
            </div>
            {transaction.memo && (
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">메모</span>
                <span className="font-medium text-sm">{transaction.memo}</span>
              </div>
            )}
          </div>

          {/* Receipt Image */}
          {transaction.receipt_url && (
            <div className="flex flex-col gap-2">
              <span className="text-gray-500 text-sm">영수증</span>
              <div
                className="relative w-full aspect-3/4 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(transaction.receipt_url!, '_blank')}
              >
                <Image
                  src={transaction.receipt_url}
                  alt="영수증"
                  fill
                  className="object-contain rounded-lg border"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          {isRecurring ? (
            <Button
              variant="outline"
              onClick={handleGoToRecurring}
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              고정 내역 관리
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                수정
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                삭제
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
