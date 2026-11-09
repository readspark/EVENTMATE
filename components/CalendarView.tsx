import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Event } from '../types';
import { parseIndianDate, formatIndianDate } from '../utils/dateUtils';

interface CalendarViewProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const d = parseIndianDate(event.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="bg-[#040e3b] border border-[#1F1F24] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">{monthNames[month]} {year}</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-full hover:bg-[#1F1F24] text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => changeMonth(1)} className="p-1.5 rounded-full hover:bg-[#1F1F24] text-slate-400 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#1F1F24] border border-[#1F1F24] rounded-lg overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="bg-[#060608] text-[10px] uppercase font-semibold text-slate-500 text-center py-2">{day}</div>
        ))}
        {blanks.map(b => (
          <div key={`blank-${b}`} className="bg-[#040e3b] min-h-[80px]"></div>
        ))}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          return (
            <div key={day} className={`bg-[#040e3b] p-1.5 min-h-[80px] ${isToday ? 'ring-1 ring-inset ring-[#7C3AED]/50' : ''}`}>
              <div className={`text-[11px] font-medium mb-1 ${isToday ? 'text-[#A78BFA]' : 'text-slate-400'}`}>{day}</div>
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="w-full text-left text-[10px] truncate px-1.5 py-0.5 rounded-full bg-[#181126] text-[#C4B5FD] hover:bg-[#2E1065] border border-[#7C3AED]/20 transition-all"
                  >
                    {event.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
