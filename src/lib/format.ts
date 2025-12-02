import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * Format number with comma separators
 * @example formatCurrency(10000) => "10,000"
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR');
}

/**
 * Format date to Korean format
 * @example formatDate('2024-12-01') => "12월 01일"
 */
export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MM월 dd일', { locale: ko });
}

/**
 * Format date with day of week
 * @example formatDateWithDay('2024-12-01') => "2024-12-01 (일)"
 */
export function formatDateWithDay(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'yyyy-MM-dd (EEE)', { locale: ko });
}

/**
 * Get year and month from date
 * @example getYearMonth('2024-12-01') => "2024년 12월"
 */
export function getYearMonth(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'yyyy년 MM월', { locale: ko });
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get first day of month
 */
export function getFirstDayOfMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

/**
 * Get last day of month
 */
export function getLastDayOfMonth(year: number, month: number): string {
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
}
