import React from 'react';
import { Calendar, MapPin, Users, Video, CalendarPlus, Trash2, ArrowRight } from 'lucide-react';
import type { Event } from '../types';
import { downloadIcsCalendarFile } from '../services/calendarService';
import { formatIndianDate, getEventStatus } from '../utils/dateUtils';

interface EventsTableViewProps {
  events: Event[];
  onEditClick: (event: Event) => void;
  onDeleteClick: (eventId: number) => void;
  onToast?: (message: string) => void;
}

export const EventsTableView: React.FC<EventsTableViewProps> = ({
  events,
  onEditClick,
  onDeleteClick,
  onToast,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B] uppercase tracking-wider bg-[#F1F5F9]">
            <th className="py-3 px-4">Event & Category</th>
            <th className="py-3 px-4">Date & Time</th>
            <th className="py-3 px-4">Location / Format</th>
            <th className="py-3 px-4 text-right">Roster & Capacity</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9] text-sm">
          {events.map((event) => {
            const count = event.registrations?.length || 0;
            const cap = event.capacity || 100;
            const pct = Math.min(100, Math.round((count / cap) * 100));
            const status = getEventStatus(event);

            return (
              <tr 
                key={event.id}
                className="hover:bg-[#F1F5F9]/60 transition-colors group cursor-pointer"
                onClick={() => onEditClick(event)}
              >
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-[#0F172A] group-hover:text-[#047857] transition-colors">
                    {event.title}
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5">
                    <span>{event.category || 'General'}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-xs font-mono tabular-nums text-[#0F172A] whitespace-nowrap">
                  <div>{formatIndianDate(event.date)}</div>
                  <div className="text-[#64748B]">{event.time || 'Schedule pending'}</div>
                </td>

                <td className="py-3.5 px-4 text-xs text-[#0F172A] max-w-xs truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    {event.isVirtual ? (
                      <Video className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-[#047857] shrink-0" />
                    )}
                    <span className="truncate">{event.location}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="font-mono tabular-nums text-xs text-[#0F172A]">
                    <span className="font-semibold">{count}</span>
                    <span className="text-[#64748B]"> / {cap} ({pct}%)</span>
                  </div>
                  <div className="w-24 h-1 bg-[#F1F5F9] rounded-full ml-auto mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${pct >= 90 ? 'bg-[#FBBF24]' : 'bg-[#047857]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span className={`text-xs font-medium ${
                    status === 'In Progress' 
                      ? 'text-[#10B981] font-semibold' 
                      : status === 'Completed'
                      ? 'text-[#64748B]'
                      : 'text-[#047857] font-semibold'
                  }`}>
                    {status}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEditClick(event)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] hover:text-[#047857] border border-[#E2E8F0] flex items-center gap-1"
                      title="Manage event"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3 text-[#64748B]" />
                    </button>

                    <button
                      onClick={() => {
                        const success = downloadIcsCalendarFile(event);
                        if (success && onToast) onToast(`Calendar invite (.ics) downloaded for "${event.title}"`);
                      }}
                      className="p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0]"
                      title="Export .ics invite"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
                          onDeleteClick(event.id);
                          if (onToast) onToast(`Event deleted`);
                        }
                      }}
                      className="p-1.5 text-[#64748B] hover:text-rose-600 rounded-full bg-[#F1F5F9] hover:bg-rose-50 border border-[#E2E8F0]"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
