'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Transaction, TransactionFormData, SortOption, DateFilter, RecurringTransaction } from '@/types/transaction';

interface UseTransactionsOptions {
  dateFilter: DateFilter;
  sortBy?: SortOption;
}

const QUERY_KEY = 'transactions';
const RECURRING_QUERY_KEY = 'recurring-transactions';

function getDateRange(filter: DateFilter): { startDate: string | null; endDate: string | null } {
  if (!filter) return { startDate: null, endDate: null };

  switch (filter.type) {
    case 'month': {
      if (!filter.year || !filter.month) return { startDate: null, endDate: null };
      const startDate = `${filter.year}-${String(filter.month).padStart(2, '0')}-01`;
      const lastDay = new Date(filter.year, filter.month, 0).getDate();
      const endDate = `${filter.year}-${String(filter.month).padStart(2, '0')}-${lastDay}`;
      return { startDate, endDate };
    }
    case 'year': {
      if (!filter.year) return { startDate: null, endDate: null };
      return {
        startDate: `${filter.year}-01-01`,
        endDate: `${filter.year}-12-31`,
      };
    }
    case 'preset':
    case 'range': {
      return {
        startDate: filter.startDate || null,
        endDate: filter.endDate || null,
      };
    }
    case 'all':
    default:
      return { startDate: null, endDate: null };
  }
}

// 고정 거래를 일반 거래로 변환 (해당 기간의 각 월에 대해)
function generateRecurringTransactions(
  recurringTransactions: RecurringTransaction[],
  startDate: string | null,
  endDate: string | null
): Transaction[] {
  const activeRecurring = recurringTransactions.filter((r) => r.is_active);
  const generated: Transaction[] = [];

  if (!startDate || !endDate) {
    // 전체 기간인 경우, 현재 월만 표시
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    activeRecurring.forEach((recurring) => {
      const day = Math.min(recurring.day_of_month, new Date(year, month + 1, 0).getDate());
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      generated.push({
        id: `recurring-${recurring.id}-${date}`,
        user_id: recurring.user_id,
        type: recurring.type,
        date,
        content: recurring.content,
        amount: recurring.amount,
        category: recurring.category,
        memo: recurring.memo,
        receipt_url: null,
        created_at: recurring.created_at,
        updated_at: recurring.updated_at,
        is_recurring: true,
        recurring_id: recurring.id,
      });
    });

    return generated;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // 시작 월부터 종료 월까지 각 월에 대해 고정 거래 생성
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  while (current <= end) {
    const year = current.getFullYear();
    const month = current.getMonth();

    activeRecurring.forEach((recurring) => {
      // 해당 월의 마지막 날 계산 (31일인데 월이 30일까지만 있는 경우 처리)
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      const day = Math.min(recurring.day_of_month, lastDayOfMonth);
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // 날짜가 필터 범위 내에 있는지 확인
      if (date >= startDate && date <= endDate) {
        generated.push({
          id: `recurring-${recurring.id}-${date}`,
          user_id: recurring.user_id,
          type: recurring.type,
          date,
          content: recurring.content,
          amount: recurring.amount,
          category: recurring.category,
          memo: recurring.memo,
          receipt_url: null,
          created_at: recurring.created_at,
          updated_at: recurring.updated_at,
          is_recurring: true,
          recurring_id: recurring.id,
        });
      }
    });

    // 다음 달로 이동
    current.setMonth(current.getMonth() + 1);
  }

  return generated;
}

// 정렬 함수
function sortTransactions(transactions: Transaction[], sortBy: SortOption): Transaction[] {
  return [...transactions].sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return b.date.localeCompare(a.date) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'date_asc':
        return a.date.localeCompare(b.date) || new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'amount_desc':
        return b.amount - a.amount;
      case 'amount_asc':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });
}

export function useTransactions({ dateFilter, sortBy = 'date_desc' }: UseTransactionsOptions) {
  const { startDate, endDate } = getDateRange(dateFilter);

  return useQuery({
    queryKey: [QUERY_KEY, RECURRING_QUERY_KEY, dateFilter, sortBy],
    queryFn: async () => {
      // 일반 거래 조회
      let query = supabase.from('transactions').select('*');

      if (startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data: transactions, error: transactionError } = await query;
      if (transactionError) throw transactionError;

      // 고정 거래 조회
      const { data: recurringData, error: recurringError } = await supabase
        .from('recurring_transactions')
        .select('*');

      if (recurringError) throw recurringError;

      // 고정 거래를 일반 거래로 변환
      const generatedTransactions = generateRecurringTransactions(
        recurringData as RecurringTransaction[],
        startDate,
        endDate
      );

      // 일반 거래에 is_recurring: false 플래그 추가
      const normalTransactions = (transactions as Transaction[]).map((t) => ({
        ...t,
        is_recurring: false,
      }));

      // 합치고 정렬
      const allTransactions = [...normalTransactions, ...generatedTransactions];
      return sortTransactions(allTransactions, sortBy);
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: TransactionFormData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...formData,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...formData }: TransactionFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUploadReceipt() {
  return useMutation({
    mutationFn: async (file: File) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);

      return data.publicUrl;
    },
  });
}
