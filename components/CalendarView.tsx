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
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-[#0F172A]">{monthNames[month]} {year}</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-full hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => changeMonth(1)} className="p-1.5 rounded-full hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#E2E8F0] border border-[#E2E8F0] rounded-lg overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="bg-[#F1F5F9] text-[12px] uppercase font-semibold text-[#64748B] text-center py-2">{day}</div>
        ))}
        {blanks.map(b => (
          <div key={`blank-${b}`} className="bg-[#F1F5F9]/40 min-h-[80px]"></div>
        ))}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          return (
            <div key={day} className={`bg-white p-1.5 min-h-[80px] ${isToday ? 'ring-1 ring-inset ring-[#047857] bg-emerald-50/20' : ''}`}>
              <div className={`text-[13px] font-medium mb-1 ${isToday ? 'text-[#047857] font-bold' : 'text-[#64748B]'}`}>{day}</div>
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="w-full text-left text-[12px] truncate px-1.5 py-0.5 rounded-full bg-emerald-50 text-[#047857] hover:bg-emerald-100 border border-[#10B981]/30 font-semibold transition-all"
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
