'use client';

import { RecurringTransaction } from '@/types/transaction';
import { formatCurrency } from '@/lib/format';
import {
  useToggleRecurringTransaction,
  useDeleteRecurringTransaction,
} from '@/hooks/useRecurringTransactions';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface RecurringTransactionListProps {
  transactions: RecurringTransaction[];
  onEdit: (transaction: RecurringTransaction) => void;
}

export function RecurringTransactionList({
  transactions,
  onEdit,
}: RecurringTransactionListProps) {
  const toggleMutation = useToggleRecurringTransaction();
  const deleteMutation = useDeleteRecurringTransaction();

  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  const totalIncome = incomeTransactions
    .filter((t) => t.is_active)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions
    .filter((t) => t.is_active)
    .reduce((sum, t) => sum + t.amount, 0);

  function handleToggle(id: string, currentStatus: boolean) {
    toggleMutation.mutate({ id, is_active: !currentStatus });
  }

  function handleDelete(id: string) {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  }

  const renderItem = (transaction: RecurringTransaction) => (
    <div
      key={transaction.id}
      className={`flex items-center justify-between p-4 bg-white rounded-lg border ${
        !transaction.is_active ? 'opacity-50' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 truncate">
            {transaction.content}
          </span>
          <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
            매월 {transaction.day_of_month}일
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{transaction.category}</span>
          {transaction.memo && (
            <span className="text-xs text-gray-400 truncate">
              · {transaction.memo}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <span
          className={`font-semibold ${
            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleToggle(transaction.id, transaction.is_active)}
        >
          {transaction.is_active ? (
            <ToggleRight className="h-5 w-5 text-green-500" />
          ) : (
            <ToggleLeft className="h-5 w-5 text-gray-400" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(transaction)}
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-600"
          onClick={() => handleDelete(transaction.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>등록된 고정 내역이 없습니다</p>
        <p className="text-sm mt-1">위의 추가 버튼으로 고정 수입/지출을 등록하세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">월 고정 수입</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            +{formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">월 고정 지출</p>
          <p className="text-xl font-bold text-red-600 mt-1">
            -{formatCurrency(totalExpense)}
          </p>
        </div>
      </div>

      {/* Income List */}
      {incomeTransactions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            고정 수입 ({incomeTransactions.length}건)
          </h3>
          <div className="space-y-2">
            {incomeTransactions.map(renderItem)}
          </div>
        </div>
      )}

      {/* Expense List */}
      {expenseTransactions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            고정 지출 ({expenseTransactions.length}건)
          </h3>
          <div className="space-y-2">
            {expenseTransactions.map(renderItem)}
          </div>
        </div>
      )}
    </div>
  );
}
