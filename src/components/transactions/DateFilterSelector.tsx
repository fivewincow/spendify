'use client';

import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DateFilter, DateFilterType, PresetRange } from '@/types/transaction';

interface DateFilterSelectorProps {
  filter: DateFilter;
  onChange: (filter: DateFilter) => void;
}

const PRESET_OPTIONS: { value: PresetRange; label: string }[] = [
  { value: '30days', label: '최근 30일' },
  { value: '90days', label: '최근 90일' },
  { value: '180days', label: '최근 180일' },
];

const FILTER_TYPE_OPTIONS: { value: DateFilterType; label: string }[] = [
  { value: 'month', label: '월별' },
  { value: 'year', label: '연도별' },
  { value: 'preset', label: '기간 선택' },
  { value: 'range', label: '직접 입력' },
  { value: 'all', label: '전체' },
];

export function DateFilterSelector({ filter, onChange }: DateFilterSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(filter.startDate || '');
  const [tempEndDate, setTempEndDate] = useState(filter.endDate || '');

  const today = new Date();

  // 월 이동
  function handlePrevMonth() {
    if (filter.type === 'month' && filter.year && filter.month) {
      if (filter.month === 1) {
        onChange({ ...filter, year: filter.year - 1, month: 12 });
      } else {
        onChange({ ...filter, month: filter.month - 1 });
      }
    }
  }

  function handleNextMonth() {
    if (filter.type === 'month' && filter.year && filter.month) {
      if (filter.month === 12) {
        onChange({ ...filter, year: filter.year + 1, month: 1 });
      } else {
        onChange({ ...filter, month: filter.month + 1 });
      }
    }
  }

  // 연도 이동
  function handlePrevYear() {
    if (filter.type === 'year' && filter.year) {
      onChange({ ...filter, year: filter.year - 1 });
    }
  }

  function handleNextYear() {
    if (filter.type === 'year' && filter.year) {
      onChange({ ...filter, year: filter.year + 1 });
    }
  }

  // 오늘로 이동
  function handleToday() {
    if (filter.type === 'month') {
      onChange({ ...filter, year: today.getFullYear(), month: today.getMonth() + 1 });
    } else if (filter.type === 'year') {
      onChange({ ...filter, year: today.getFullYear() });
    }
  }

  // 필터 타입 변경
  function handleTypeChange(type: DateFilterType) {
    switch (type) {
      case 'month':
        onChange({
          type: 'month',
          year: today.getFullYear(),
          month: today.getMonth() + 1,
        });
        break;
      case 'year':
        onChange({
          type: 'year',
          year: today.getFullYear(),
        });
        break;
      case 'preset':
        onChange({
          type: 'preset',
          preset: '30days',
          startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd'),
        });
        break;
      case 'range':
        setTempStartDate(filter.startDate || format(subDays(today, 30), 'yyyy-MM-dd'));
        setTempEndDate(filter.endDate || format(today, 'yyyy-MM-dd'));
        setIsDialogOpen(true);
        break;
      case 'all':
        onChange({ type: 'all' });
        break;
    }
  }

  // 프리셋 변경
  function handlePresetChange(preset: PresetRange) {
    const days = preset === '30days' ? 30 : preset === '90days' ? 90 : 180;
    onChange({
      type: 'preset',
      preset,
      startDate: format(subDays(today, days), 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    });
  }

  // 직접 입력 적용
  function handleRangeApply() {
    if (tempStartDate && tempEndDate) {
      onChange({
        type: 'range',
        startDate: tempStartDate,
        endDate: tempEndDate,
      });
      setIsDialogOpen(false);
    }
  }

  // 현재 필터 라벨 표시
  function getFilterLabel(): string {
    switch (filter.type) {
      case 'month':
        return `${filter.year}년 ${filter.month}월`;
      case 'year':
        return `${filter.year}년`;
      case 'preset':
        return PRESET_OPTIONS.find((o) => o.value === filter.preset)?.label || '';
      case 'range':
        if (filter.startDate && filter.endDate) {
          return `${format(new Date(filter.startDate), 'yy.MM.dd')} ~ ${format(new Date(filter.endDate), 'yy.MM.dd')}`;
        }
        return '기간 선택';
      case 'all':
        return '전체';
      default:
        return '';
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* 필터 타입 선택 */}
      <Select
        value={filter.type}
        onValueChange={(value) => handleTypeChange(value as DateFilterType)}
      >
        <SelectTrigger className="w-28 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FILTER_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 월별 네비게이션 */}
      {filter.type === 'month' && (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <button
            onClick={handleToday}
            className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors min-w-[80px]"
          >
            {filter.year}년 {filter.month}월
          </button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 연도별 네비게이션 */}
      {filter.type === 'year' && (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handlePrevYear}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <button
            onClick={handleToday}
            className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors min-w-[60px]"
          >
            {filter.year}년
          </button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNextYear}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 프리셋 선택 */}
      {filter.type === 'preset' && (
        <Select
          value={filter.preset}
          onValueChange={(value) => handlePresetChange(value as PresetRange)}
        >
          <SelectTrigger className="w-32 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESET_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* 직접 입력 버튼 */}
      {filter.type === 'range' && (
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => {
            setTempStartDate(filter.startDate || '');
            setTempEndDate(filter.endDate || '');
            setIsDialogOpen(true);
          }}
        >
          <Calendar className="h-4 w-4 mr-2" />
          {filter.startDate && filter.endDate
            ? `${format(new Date(filter.startDate), 'yy.MM.dd')} ~ ${format(new Date(filter.endDate), 'yy.MM.dd')}`
            : '기간 선택'}
        </Button>
      )}

      {/* 직접 입력 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>기간 직접 입력</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">시작일</Label>
              <input
                id="startDate"
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                className="w-full h-10 px-3 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">종료일</Label>
              <input
                id="endDate"
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                className="w-full h-10 px-3 border rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleRangeApply} disabled={!tempStartDate || !tempEndDate}>
              적용
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
