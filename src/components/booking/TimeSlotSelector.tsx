'use client';

import React from 'react';
import { TimeSlot } from '@/types';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelectSlot: (slotTime: string) => void;
  isLoading: boolean;
}

export function TimeSlotSelector({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading,
}: TimeSlotSelectorProps) {
  if (isLoading) {
    return (
      <div className="w-full py-8 text-center border border-neutral-200 bg-white">
        <div className="inline-block animate-spin h-5 w-5 border-2 border-neutral-900 border-t-transparent mb-2"></div>
        <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
          Checking real-time slot availability...
        </p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="w-full p-8 text-center border border-neutral-200 bg-white">
        <Clock className="w-6 h-6 mx-auto mb-2 text-neutral-400" />
        <p className="text-sm font-medium text-neutral-900 mb-1">No sessions available on this date</p>
        <p className="text-xs text-neutral-500">Please select an upcoming operating day.</p>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.available);

  // Group slots according to the schedule:
  // Midday: 12:00 PM - 2:30 PM
  const middaySlots = slots.filter((s) => s.time < '14:30');
  // Afternoon: 3:00 PM - 5:30 PM
  const afternoonSlots = slots.filter((s) => s.time >= '15:00' && s.time < '17:30');
  // Evening: 6:00 PM - 8:00 PM
  const eveningSlots = slots.filter((s) => s.time >= '18:00');

  const renderSlotGroup = (title: string, groupSlots: TimeSlot[]) => {
    if (groupSlots.length === 0) return null;

    return (
      <div className="mb-6 last:mb-0">
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block mb-2.5">
          {title}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {groupSlots.map((slot) => {
            const isSelected = selectedSlot === slot.time;
            const isAvailable = slot.available;

            return (
              <button
                key={slot.time}
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelectSlot(slot.time)}
                className={cn(
                  'h-12 px-3 border text-center flex flex-col justify-center items-center transition-all min-h-[46px]',
                  isSelected
                    ? 'bg-neutral-950 text-white border-neutral-950 shadow-sm'
                    : isAvailable
                    ? 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-950'
                    : 'bg-neutral-50 text-neutral-400 border-neutral-100 cursor-not-allowed'
                )}
              >
                <span className="font-mono text-xs sm:text-sm font-medium tracking-wide">
                  {slot.formattedTime}
                </span>
                <span
                  className={cn(
                    'text-[9px] font-mono tracking-wider uppercase',
                    isSelected
                      ? 'text-neutral-300'
                      : isAvailable
                      ? 'text-neutral-500'
                      : 'text-neutral-400'
                  )}
                >
                  {isAvailable ? '15 min' : slot.reason === 'break' ? 'Break' : 'Reserved'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">
          2. Select 15-Minute Slot
        </label>
        <span className="text-xs font-mono text-neutral-500">
          {availableSlots.length} slot{availableSlots.length === 1 ? '' : 's'} free
        </span>
      </div>

      <div className="bg-white border border-neutral-200 p-5 sm:p-6">
        {renderSlotGroup('Midday (12:00 PM – 2:30 PM)', middaySlots)}
        {renderSlotGroup('Afternoon (3:00 PM – 5:30 PM)', afternoonSlots)}
        {renderSlotGroup('Evening (6:00 PM – 8:00 PM)', eveningSlots)}
      </div>
    </div>
  );
}
