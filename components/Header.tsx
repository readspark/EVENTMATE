import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, Plus, User as UserIcon, LogOut } from 'lucide-react';
import type { User } from '../types';

interface HeaderProps {
  user: User | null;
  activeView: 'events' | 'ideation';
  onViewChange: (view: 'events' | 'ideation') => void;
  onNewEventClick: () => void;
  onMyEventsClick: () => void;
  onSignInClick: () => void;
  onSignOutClick: () => void;
  onEditProfileClick: () => void;
  activeEventCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeView,
  onViewChange,
  onNewEventClick,
  onMyEventsClick,
  onSignInClick,
  onSignOutClick,
  onEditProfileClick,
  activeEventCount,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-[#1F1F24]">
      <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between gap-6">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-white shadow-xs">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">
            EventMate
          </span>
        </div>

        {/* Zone 2: Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#0C0C0E] p-1 rounded-full border border-[#1F1F24]">
          <button
            type="button"
            onClick={() => onViewChange('events')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 flex items-center gap-2 focus:outline-none focus:ring-0 select-none ${
              activeView === 'events'
                ? 'bg-[#181126] text-white font-medium border border-[#7C3AED]/40 shadow-xs'
                : 'text-[#8E8E93] hover:text-white border border-transparent'
            }`}
          >
            <span>Events</span>
            <span className="font-mono text-[11px] text-[#A78BFA] tabular-nums">
              {activeEventCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onViewChange('ideation')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 flex items-center gap-1.5 focus:outline-none focus:ring-0 select-none ${
              activeView === 'ideation'
                ? 'bg-[#181126] text-white font-medium border border-[#7C3AED]/40 shadow-xs'
                : 'text-[#8E8E93] hover:text-white border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>AI Brainstorm</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action + User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onNewEventClick}
            className="flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium py-1.5 px-4 rounded-full shadow-xs transition-all whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Event</span>
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-8 w-8 rounded-full bg-[#181126] border border-[#7C3AED]/40 flex items-center justify-center text-[#C4B5FD] font-medium text-xs hover:border-[#7C3AED] focus:outline-none transition-colors"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-black border border-[#1F1F24] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div
                    onClick={() => { setIsDropdownOpen(false); onEditProfileClick(); }}
                    className="p-3 border-b border-[#1F1F24] hover:bg-[#0C0C0E] cursor-pointer transition-colors"
                  >
                    <p className="font-medium text-white text-xs truncate">{user.name}</p>
                    <p className="text-[11px] text-[#8E8E93] truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => { setIsDropdownOpen(false); onMyEventsClick(); }}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#8E8E93] hover:text-white hover:bg-[#0C0C0E] flex items-center gap-2 transition-colors rounded-xl mx-1"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#8E8E93]" />
                    <span>View All Planned</span>
                  </button>

                  <div className="border-t border-[#1F1F24] my-1" />

                  <button
                    onClick={() => { setIsDropdownOpen(false); onSignOutClick(); }}
                    className="w-full text-left px-3.5 py-2 text-xs text-[#EF4444] hover:bg-rose-950/20 flex items-center gap-2 transition-colors font-medium rounded-xl mx-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              className="text-xs font-medium text-[#8E8E93] hover:text-white py-1.5 px-3.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
