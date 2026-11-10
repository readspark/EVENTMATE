import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Video, CalendarPlus, Trash2, ArrowRight } from 'lucide-react';
import type { Event } from '../types';
import { downloadIcsCalendarFile } from '../services/calendarService';
import { formatIndianDate, getEventStatus } from '../utils/dateUtils';

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
  const currentStatus = getEventStatus(event);

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
      className="group bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md"
      onMouseLeave={() => setIsConfirmingDelete(false)}
    >
      <div>
        {/* Zero-Pill Metadata Lead-in */}
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2.5">
          <span className="font-semibold text-[#047857]">{event.category || 'General'}</span>
          <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
          <span className={
            currentStatus === 'In Progress'
              ? 'text-[#10B981] font-semibold animate-pulse'
              : currentStatus === 'Completed'
              ? 'text-[#64748B] font-medium'
              : 'text-[#047857] font-semibold'
          }>
            {currentStatus}
          </span>
          <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
          <span className="font-mono tabular-nums text-[#64748B]">{formatIndianDate(event.date)}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#0F172A] tracking-tight group-hover:text-[#047857] transition-colors line-clamp-1 mb-2">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#64748B] line-clamp-2 leading-relaxed mb-4">
          {event.description}
        </p>

        {/* Logistics Information */}
        <div className="space-y-1.5 text-xs text-[#64748B] border-t border-[#F1F5F9] pt-3 mb-4">
          <div className="flex items-center gap-2 truncate">
            {event.isVirtual ? (
              <Video className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-[#047857] shrink-0" />
            )}
            <span className="truncate">{event.location || 'Location to be announced'}</span>
          </div>

          {event.time && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span className="font-mono tabular-nums text-[#0F172A]">{event.time}</span>
            </div>
          )}
        </div>

        {/* Capacity & Registrations Progress */}
        <div className="space-y-1.5 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Attendees</span>
            </span>
            <span className="font-mono tabular-nums text-[#0F172A] font-semibold">
              {registrationsCount} <span className="text-[#64748B] font-normal">/ {capacity} ({percentFilled}%)</span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                percentFilled >= 90 ? 'bg-[#FBBF24]' : 'bg-[#047857]'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#F1F5F9]">
        <button
          onClick={() => onEditClick(event)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] hover:text-[#047857] transition-colors border border-[#E2E8F0]"
        >
          <span>Manage</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
        </button>

        <button
          onClick={handleCalendarDownload}
          className="p-2 text-[#64748B] hover:text-[#0F172A] rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] transition-colors"
          title="Download .ics Calendar Invite"
          aria-label="Download calendar invite"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleDelete}
          className={`px-3 py-2 text-xs font-semibold rounded-full transition-colors border ${
            isConfirmingDelete
              ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700'
              : 'text-[#64748B] hover:text-rose-600 bg-[#F1F5F9] hover:bg-rose-50 border-[#E2E8F0]'
          }`}
          title={isConfirmingDelete ? 'Click again to permanently delete' : 'Delete event'}
        >
          {isConfirmingDelete ? 'Confirm?' : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
