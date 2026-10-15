'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface DateItem {
  dateStr: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
  isOperating: boolean;
}

interface DatePickerProps {
  dates: DateItem[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export function DatePicker({ dates, selectedDate, onSelectDate }: DatePickerProps) {
  return (
    <div className="w-full">
      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3">
        1. Select Date
      </label>

      {/* Mobile scrollable date carousel / desktop flex */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin no-scrollbar -mx-1 px-1">
        {dates.map((d) => {
          const isSelected = selectedDate === d.dateStr;
          const isDisabled = !d.isOperating;

          return (
            <button
              key={d.dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(d.dateStr)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center justify-center w-[72px] sm:w-20 h-[88px] border transition-all text-center',
                isSelected
                  ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                  : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-400',
                isDisabled && 'opacity-35 cursor-not-allowed bg-neutral-50 border-neutral-200 hover:border-neutral-200'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-mono uppercase tracking-wider mb-1',
                  isSelected ? 'text-neutral-400' : 'text-neutral-500'
                )}
              >
                {d.dayName}
              </span>
              <span className="font-editorial text-2xl font-medium leading-none mb-1">
                {d.dayNumber}
              </span>
              <span
                className={cn(
                  'text-[10px] font-mono uppercase',
                  isSelected ? 'text-neutral-300' : 'text-neutral-500'
                )}
              >
                {d.monthName}
              </span>
              {d.isToday && (
                <span
                  className={cn(
                    'text-[8px] font-mono uppercase tracking-widest mt-1 px-1',
                    isSelected ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-600'
                  )}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
