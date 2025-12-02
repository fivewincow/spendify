'use client';

import { List, Calendar } from 'lucide-react';

export type PageViewMode = 'list' | 'calendar';

interface ViewModeTabProps {
  mode: PageViewMode;
  onChange: (mode: PageViewMode) => void;
}

export function ViewModeTab({ mode, onChange }: ViewModeTabProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange('list')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
          mode === 'list'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <List className="h-4 w-4" />
        리스트
      </button>
      <button
        onClick={() => onChange('calendar')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
          mode === 'calendar'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Calendar className="h-4 w-4" />
        캘린더
      </button>
    </div>
  );
}
