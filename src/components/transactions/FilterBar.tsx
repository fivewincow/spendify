'use client';

import { SortOption, ViewMode } from '@/types/transaction';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { List, LayoutList, Plus } from 'lucide-react';

interface FilterBarProps {
  sortBy: SortOption;
  viewMode: ViewMode;
  onSortChange: (sort: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onAddClick?: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: '최신순' },
  { value: 'date_asc', label: '오래된순' },
  { value: 'amount_desc', label: '금액 높은순' },
  { value: 'amount_asc', label: '금액 낮은순' },
];

export function FilterBar({
  sortBy,
  viewMode,
  onSortChange,
  onViewModeChange,
  onAddClick,
}: FilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {/* Sort Select */}
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Add Button */}
        {onAddClick && (
          <Button size="sm" onClick={onAddClick}>
            <Plus className="h-4 w-4 mr-1" />
            추가
          </Button>
        )}
      </div>

      {/* View Mode Toggle */}
      <div className="flex border rounded-lg overflow-hidden">
        <Button
          variant={viewMode === 'grouped' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grouped')}
          className="rounded-none px-3"
        >
          <LayoutList className="h-4 w-4 mr-1" />
          그룹
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('list')}
          className="rounded-none px-3"
        >
          <List className="h-4 w-4 mr-1" />
          목록
        </Button>
      </div>
    </div>
  );
}
