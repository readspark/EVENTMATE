import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Video } from 'lucide-react';
import type { Event, EventCategory } from '../types';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: Event) => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00 AM - 05:00 PM');
  const [location, setLocation] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [category, setCategory] = useState<EventCategory>('Conference');
  const [capacity, setCapacity] = useState<number>(100);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    const newEvent: Event = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim() || 'Comprehensive event agenda and programming.',
      date: date.trim(),
      time: time.trim(),
      location: location.trim() || (isVirtual ? 'Virtual Meeting' : 'Venue to be decided'),
      isVirtual,
      category,
      status: 'Upcoming',
      capacity: Number(capacity) || 100,
      registrations: [],
      agenda: []
    };

    onCreate(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Create New Event</h2>
            <p className="text-xs text-slate-400 mt-0.5">Configure initial event parameters and capacity</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Executive Product Summit"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
              >
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Meetup">Meetup</option>
                <option value="Webinar">Webinar</option>
                <option value="Networking">Networking</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Max Capacity
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="2026-12-10"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09:00 AM - 05:00 PM"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Location
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVirtual}
                  onChange={(e) => setIsVirtual(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Virtual / Online</span>
              </label>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={isVirtual ? 'e.g. https://meet.google.com/...' : 'e.g. 500 Howard St, San Francisco'}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Brief Overview
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Outline the core objective and target audience..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
