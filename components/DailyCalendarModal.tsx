import React, { useState } from 'react';
import { X, Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Event } from '../types';
import { formatIndianDate } from '../utils/dateUtils';

interface DailyCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
}

export const DailyCalendarModal: React.FC<DailyCalendarModalProps> = ({ isOpen, onClose, events }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (!isOpen) return null;

  const formatDateKey = (date: Date) => {
    // DD/MM/YYYY based on the existing utility
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const selectedDateKey = formatDateKey(selectedDate);
  const todaysEvents = events.filter(e => e.date === selectedDateKey);

  const changeDate = (days: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(nextDate);
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight">Daily Planner</h2>
            <div className="flex items-center gap-2 mt-1">
                <button onClick={() => changeDate(-1)} className="p-1 rounded-full hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"><ChevronLeft className="w-4 h-4"/></button>
                <p className="text-xs text-[#047857] font-mono font-semibold tabular-nums">{selectedDateKey}</p>
                <button onClick={() => changeDate(1)} className="p-1 rounded-full hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A]"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-full hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {todaysEvents.length > 0 ? (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {todaysEvents.map((event) => (
              <div
                key={event.id}
                className="bg-[#F1F5F9] border border-[#E2E8F0] p-3.5 rounded-xl flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[#0F172A] text-sm truncate">
                    {event.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1">
                    <span className="font-mono tabular-nums text-[#047857] font-semibold">{event.time}</span>
                    <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-[#64748B] border border-dashed border-[#CBD5E1] rounded-xl">
            No events scheduled for {selectedDateKey}.
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] hover:text-[#047857] text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
