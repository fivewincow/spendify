export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  content: string;
  amount: number;
  category: string;
  memo: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  is_recurring?: boolean; // 고정 수입/지출에서 생성된 거래인지 여부
  recurring_id?: string; // 원본 고정 거래 ID
}

export interface TransactionFormData {
  type: TransactionType;
  date: string;
  content: string;
  amount: number;
  category: string;
  memo?: string;
  receipt_url?: string;
}

export type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';

export type ViewMode = 'grouped' | 'list';

export type DateFilterType = 'month' | 'year' | 'range' | 'preset' | 'all';

export type PresetRange = '30days' | '90days' | '180days';

export interface DateFilter {
  type: DateFilterType;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
  preset?: PresetRange;
}

export const EXPENSE_CATEGORIES = [
  '식비',
  '교통',
  '쇼핑',
  '문화/여가',
  '의료',
  '교육',
  '주거',
  '통신',
  '보험',
  '구독',
  '기타',
] as const;

export const INCOME_CATEGORIES = [
  '월급',
  '용돈',
  '부수입',
  '이자',
  '배당',
  '기타',
] as const;

// 고정 수입/지출 관련 타입
export interface RecurringTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  content: string;
  amount: number;
  category: string;
  day_of_month: number; // 1-31, 매월 몇 일에 발생하는지
  memo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecurringTransactionFormData {
  type: TransactionType;
  content: string;
  amount: number;
  category: string;
  day_of_month: number;
  memo?: string;
}
