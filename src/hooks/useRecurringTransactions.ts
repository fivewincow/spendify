'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { RecurringTransaction, RecurringTransactionFormData } from '@/types/transaction';

const QUERY_KEY = 'recurring-transactions';

export function useRecurringTransactions() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .order('day_of_month', { ascending: true });

      if (error) throw error;
      return data as RecurringTransaction[];
    },
  });
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: RecurringTransactionFormData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          ...formData,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as RecurringTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...formData }: RecurringTransactionFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as RecurringTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useToggleRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as RecurringTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
