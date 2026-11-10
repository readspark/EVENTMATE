import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, Video } from 'lucide-react';
import type { Event, EventCategory, User } from '../types';
import { normalizeToIndianDate, getEventStatus } from '../utils/dateUtils';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (event: Event) => void;
  currentUser: User | null;
  onRequireSignIn: (event: Event) => void;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  currentUser, 
  onRequireSignIn 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [category, setCategory] = useState<EventCategory>('Conference');
  const [capacity, setCapacity] = useState<number>(100);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setLocation('');
      setIsVirtual(false);
      setCategory('Conference');
      setCapacity(100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    const newEvent: Event = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim() || 'Comprehensive event agenda and programming.',
      date: normalizeToIndianDate(date.trim()),
      time: time.trim(),
      location: location.trim() || (isVirtual ? 'Virtual Meeting' : 'Venue to be decided'),
      isVirtual,
      category,
      status: getEventStatus({ date: normalizeToIndianDate(date.trim()), time: time.trim() }),
      capacity: Number(capacity) || 100,
      registrations: [],
      agenda: []
    };

    if (!currentUser) {
      onRequireSignIn(newEvent);
      return;
    }

    onCreate(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-w-lg w-full p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">Create New Event</h2>
            <p className="text-xs text-[#64748B] mt-0.5">Configure initial event parameters and capacity</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-full hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Executive Product Summit"
              className="w-full px-3.5 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#047857]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm focus:bg-white focus:ring-1 focus:ring-[#047857]"
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
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Max Capacity
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm font-mono tabular-nums focus:bg-white focus:ring-1 focus:ring-[#047857]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Date (DD/MM/YYYY)
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 24/11/2026"
                className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm font-mono focus:bg-white focus:ring-1 focus:ring-[#047857]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                Time
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09:00 AM - 05:00 PM"
                className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm font-mono focus:bg-white focus:ring-1 focus:ring-[#047857]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Location
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#64748B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVirtual}
                  onChange={(e) => setIsVirtual(e.target.checked)}
                  className="rounded border-[#CBD5E1] text-[#047857] focus:ring-[#047857]"
                />
                <span>Virtual / Online</span>
              </label>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={isVirtual ? 'e.g. https://meet.google.com/...' : 'e.g. 500 Howard St, San Francisco'}
              className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm focus:bg-white focus:ring-1 focus:ring-[#047857]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Brief Overview
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Outline the core objective and target audience..."
              className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm focus:bg-white focus:ring-1 focus:ring-[#047857]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold rounded-full bg-[#047857] hover:bg-[#065f46] text-white shadow-xs transition-all"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
