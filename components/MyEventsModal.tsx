import React from 'react';
import { X, Calendar, MapPin, ArrowRight } from 'lucide-react';
import type { Event } from '../types';
import { formatIndianDate } from '../utils/dateUtils';

interface MyEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  onSelectEvent?: (event: Event) => void;
}

export const MyEventsModal: React.FC<MyEventsModalProps> = ({ isOpen, onClose, events, onSelectEvent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-w-lg w-full p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight">Active Event Portfolio</h2>
            <p className="text-xs text-[#64748B] font-mono tabular-nums">{events.length} planned events</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-full hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {events.length > 0 ? (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => {
                  if (onSelectEvent) {
                    onSelectEvent(event);
                    onClose();
                  }
                }}
                className="bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#10B981]/60 hover:bg-[#F1F5F9]/90 p-3.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer group transition-colors text-[#0F172A]"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[#0F172A] text-sm truncate group-hover:text-[#047857] transition-colors">
                    {event.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1">
                    <span className="font-mono tabular-nums text-[#047857] font-semibold">{formatIndianDate(event.date)}</span>
                    <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                    <span className="truncate">{event.location}</span>
                    <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                    <span className="font-mono tabular-nums text-[#64748B]">{event.registrations?.length || 0} registered</span>
                  </div>
                </div>

                <div className="p-1 text-[#64748B] group-hover:text-[#047857] transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-[#64748B] border border-dashed border-[#CBD5E1] rounded-xl">
            No events planned yet. Use the ideation tool or create your first event!
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
