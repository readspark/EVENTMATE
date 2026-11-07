import React from 'react';
import { X, Calendar, MapPin, ArrowRight } from 'lucide-react';
import type { Event } from '../types';

interface MyEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  onSelectEvent?: (event: Event) => void;
}

export const MyEventsModal: React.FC<MyEventsModalProps> = ({ isOpen, onClose, events, onSelectEvent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Active Event Portfolio</h2>
            <p className="text-xs text-slate-400 font-mono tabular-nums">{events.length} planned events</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
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
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-3.5 rounded-lg flex items-center justify-between gap-3 cursor-pointer group transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-white text-sm truncate group-hover:text-indigo-300 transition-colors">
                    {event.title}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="font-mono tabular-nums">{event.date}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="truncate">{event.location}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="font-mono tabular-nums">{event.registrations?.length || 0} registered</span>
                  </div>
                </div>

                <div className="p-1 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
            No events planned yet. Use the ideation tool or create your first event!
          </div>
        )}

        <div className="pt-4 mt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
