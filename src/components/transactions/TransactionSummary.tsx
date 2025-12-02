'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Transaction, DateFilter } from '@/types/transaction';
import { formatCurrency } from '@/lib/format';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface TransactionSummaryProps {
  transactions: Transaction[];
  dateFilter: DateFilter;
}

function getDateLabel(filter: DateFilter): string {
  switch (filter.type) {
    case 'month':
      return `${filter.year}년 ${filter.month}월`;
    case 'year':
      return `${filter.year}년`;
    case 'preset':
      if (filter.preset === '30days') return '최근 30일';
      if (filter.preset === '90days') return '최근 90일';
      if (filter.preset === '180days') return '최근 180일';
      return '';
    case 'range':
      if (filter.startDate && filter.endDate) {
        return `${format(new Date(filter.startDate), 'yyyy.MM.dd')} ~ ${format(new Date(filter.endDate), 'yyyy.MM.dd')}`;
      }
      return '';
    case 'all':
      return '전체 기간';
    default:
      return '';
  }
}

export function TransactionSummary({ transactions, dateFilter }: TransactionSummaryProps) {
  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [transactions]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {getDateLabel(dateFilter)}
      </h2>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Income */}
        <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
          <TrendingUp className="w-5 h-5 text-green-600 mb-1" />
          <span className="text-xs text-gray-500 mb-1">수입</span>
          <span className="text-sm sm:text-base font-bold text-green-600">
            {formatCurrency(summary.income)}
          </span>
        </div>

        {/* Expense */}
        <div className="flex flex-col items-center p-3 bg-red-50 rounded-lg">
          <TrendingDown className="w-5 h-5 text-red-600 mb-1" />
          <span className="text-xs text-gray-500 mb-1">지출</span>
          <span className="text-sm sm:text-base font-bold text-red-600">
            {formatCurrency(summary.expense)}
          </span>
        </div>

        {/* Balance */}
        <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
          <Wallet className="w-5 h-5 text-blue-600 mb-1" />
          <span className="text-xs text-gray-500 mb-1">잔액</span>
          <span
            className={`text-sm sm:text-base font-bold ${
              summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}
          >
            {summary.balance >= 0 ? '+' : ''}
            {formatCurrency(summary.balance)}
          </span>
        </div>
      </div>
    </div>
  );
}
