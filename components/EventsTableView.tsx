import React from 'react';
import { Calendar, MapPin, Users, Video, CalendarPlus, Trash2, ArrowRight } from 'lucide-react';
import type { Event } from '../types';
import { downloadIcsCalendarFile } from '../services/calendarService';
import { formatIndianDate } from '../utils/dateUtils';

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
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-900">
            <th className="py-3 px-4">Event & Category</th>
            <th className="py-3 px-4">Date & Time</th>
            <th className="py-3 px-4">Location / Format</th>
            <th className="py-3 px-4 text-right">Roster & Capacity</th>
            <th className="py-3 px-4 text-center">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80 text-sm">
          {events.map((event) => {
            const count = event.registrations?.length || 0;
            const cap = event.capacity || 100;
            const pct = Math.min(100, Math.round((count / cap) * 100));

            return (
              <tr 
                key={event.id}
                className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                onClick={() => onEditClick(event)}
              >
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {event.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    <span>{event.category || 'General'}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-xs font-mono tabular-nums text-slate-300 whitespace-nowrap">
                  <div>{formatIndianDate(event.date)}</div>
                  <div className="text-slate-500">{event.time || 'Schedule pending'}</div>
                </td>

                <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    {event.isVirtual ? (
                      <Video className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate">{event.location}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="font-mono tabular-nums text-xs text-slate-200">
                    <span className="font-semibold">{count}</span>
                    <span className="text-slate-500"> / {cap} ({pct}%)</span>
                  </div>
                  <div className="w-24 h-1 bg-slate-800 rounded-full ml-auto mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${pct >= 90 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </td>

                <td className="py-3.5 px-4 text-center">
                  <span className="text-xs font-medium text-slate-300">
                    {event.status || 'Upcoming'}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEditClick(event)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1"
                      title="Manage event"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        const success = downloadIcsCalendarFile(event);
                        if (success && onToast) onToast(`Calendar invite (.ics) downloaded for "${event.title}"`);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700"
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
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700"
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
