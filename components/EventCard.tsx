import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Video, CalendarPlus, Trash2, ArrowRight } from 'lucide-react';
import type { Event } from '../types';
import { downloadIcsCalendarFile } from '../services/calendarService';
import { formatIndianDate } from '../utils/dateUtils';

interface EventCardProps {
  event: Event;
  onEditClick: (event: Event) => void;
  onDeleteClick: (eventId: number) => void;
  onToast?: (message: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onEditClick,
  onDeleteClick,
  onToast,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const registrationsCount = event.registrations?.length || 0;
  const capacity = event.capacity || 100;
  const percentFilled = Math.min(100, Math.round((registrationsCount / capacity) * 100));

  useEffect(() => {
    if (!isConfirmingDelete) return;
    const timer = setTimeout(() => setIsConfirmingDelete(false), 3500);
    return () => clearTimeout(timer);
  }, [isConfirmingDelete]);

  const handleCalendarDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = downloadIcsCalendarFile(event);
    if (success && onToast) {
      onToast(`Calendar invite (.ics) downloaded for "${event.title}"`);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirmingDelete) {
      onDeleteClick(event.id);
      if (onToast) onToast(`Event "${event.title}" deleted`);
    } else {
      setIsConfirmingDelete(true);
    }
  };

  return (
    <div 
      className="group bg-slate-900 border border-slate-800 hover:border-slate-700/90 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md"
      onMouseLeave={() => setIsConfirmingDelete(false)}
    >
      <div>
        {/* Zero-Pill Metadata Lead-in */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5">
          <span className="font-medium text-indigo-400">{event.category || 'General'}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{event.status || 'Upcoming'}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono tabular-nums">{formatIndianDate(event.date)}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-300/90 line-clamp-2 leading-relaxed mb-4">
          {event.description}
        </p>

        {/* Logistics Information */}
        <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3 mb-4">
          <div className="flex items-center gap-2 truncate">
            {event.isVirtual ? (
              <Video className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="truncate">{event.location || 'Location to be announced'}</span>
          </div>

          {event.time && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="font-mono tabular-nums">{event.time}</span>
            </div>
          )}
        </div>

        {/* Capacity & Registrations Progress */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Attendees</span>
            </span>
            <span className="font-mono tabular-nums text-slate-300 font-medium">
              {registrationsCount} <span className="text-slate-500 font-normal">/ {capacity} ({percentFilled}%)</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                percentFilled >= 90 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
        <button
          onClick={() => onEditClick(event)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700/60"
        >
          <span>Manage</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={handleCalendarDownload}
          className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          title="Download .ics Calendar Invite"
          aria-label="Download calendar invite"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleDelete}
          className={`px-3 py-2 text-xs font-semibold rounded-full transition-colors border ${
            isConfirmingDelete
              ? 'bg-rose-900/60 text-rose-200 border-rose-700 hover:bg-rose-900'
              : 'text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
          }`}
          title={isConfirmingDelete ? 'Click again to permanently delete' : 'Delete event'}
        >
          {isConfirmingDelete ? 'Confirm?' : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
