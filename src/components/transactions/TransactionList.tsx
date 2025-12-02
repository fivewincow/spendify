'use client';

import { useMemo } from 'react';
import { Transaction, ViewMode } from '@/types/transaction';
import { TransactionItem } from './TransactionItem';
import { formatDateWithDay } from '@/lib/format';

interface TransactionListProps {
  transactions: Transaction[];
  viewMode: ViewMode;
  onItemClick: (transaction: Transaction) => void;
}

interface GroupedTransactions {
  [date: string]: Transaction[];
}

export function TransactionList({
  transactions,
  viewMode,
  onItemClick,
}: TransactionListProps) {
  const groupedTransactions = useMemo(() => {
    if (viewMode === 'list') return null;

    return transactions.reduce<GroupedTransactions>((acc, transaction) => {
      const date = transaction.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {});
  }, [transactions, viewMode]);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-lg">등록된 내역이 없습니다</p>
        <p className="text-sm mt-1">새로운 내역을 추가해보세요</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col gap-2">
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onClick={onItemClick}
          />
        ))}
      </div>
    );
  }

  // Grouped view
  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groupedTransactions!).map(([date, items]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-gray-600 mb-2 px-1">
            {formatDateWithDay(date)}
          </h3>
          <div className="flex flex-col gap-2">
            {items.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onClick={onItemClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
