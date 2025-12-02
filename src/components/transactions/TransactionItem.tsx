'use client';

import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDate } from '@/lib/format';
import { ArrowDownCircle, ArrowUpCircle, Receipt, Pin } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onClick: (transaction: Transaction) => void;
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const isExpense = transaction.type === 'expense';

  return (
    <div
      onClick={() => onClick(transaction)}
      className={`flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border ${
        transaction.is_recurring ? 'border-dashed border-purple-300' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
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
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            {transaction.is_recurring && (
              <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">
                <Pin className="w-3 h-3" />
                고정
              </span>
            )}
            <span className="font-medium text-gray-900">{transaction.content}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
              {transaction.category}
            </span>
            <span className="hidden sm:inline">{formatDate(transaction.date)}</span>
            {transaction.receipt_url && (
              <Receipt className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`font-semibold ${
            isExpense ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {isExpense ? '-' : '+'}
          {formatCurrency(transaction.amount)}원
        </span>
      </div>
    </div>
  );
}
