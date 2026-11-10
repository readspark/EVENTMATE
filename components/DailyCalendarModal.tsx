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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-end justify-end p-4 sm:p-6 z-50 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-5 relative mb-[85px] animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Daily Planner</h2>
            <div className="flex items-center gap-2 mt-1">
                <button onClick={() => changeDate(-1)} className="p-1 rounded-full hover:bg-slate-800"><ChevronLeft className="w-4 h-4"/></button>
                <p className="text-xs text-slate-300 font-mono tabular-nums">{selectedDateKey}</p>
                <button onClick={() => changeDate(1)} className="p-1 rounded-full hover:bg-slate-800"><ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {todaysEvents.length > 0 ? (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {todaysEvents.map((event) => (
              <div
                key={event.id}
                className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-white text-sm truncate">
                    {event.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="font-mono tabular-nums">{event.time}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
            No events scheduled for {selectedDateKey}.
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
