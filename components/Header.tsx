import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, Plus, User as UserIcon, LogOut, Settings } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            EventMate
          </span>
        </div>

        {/* Zone 2: Clean View Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onViewChange('events')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
              activeView === 'events'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Events</span>
            <span className="font-mono text-[11px] text-slate-400 tabular-nums">
              {activeEventCount}
            </span>
          </button>

          <button
            onClick={() => onViewChange('ideation')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeView === 'ideation'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Brainstorm</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action + User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onNewEventClick}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-3.5 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs hover:bg-slate-700 focus:outline-none transition-colors"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div
                    onClick={() => { setIsDropdownOpen(false); onEditProfileClick(); }}
                    className="p-3 border-b border-slate-800/80 hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-white text-xs truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => { setIsDropdownOpen(false); onMyEventsClick(); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/60 flex items-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>View All Planned</span>
                  </button>

                  <div className="border-t border-slate-800/80 my-1" />

                  <button
                    onClick={() => { setIsDropdownOpen(false); onSignOutClick(); }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
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
              className="text-xs font-medium text-slate-300 hover:text-white py-1.5 px-3 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
