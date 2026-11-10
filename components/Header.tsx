import React, { useState, useEffect, useRef } from 'react';
import { Calendar, LogOut } from 'lucide-react';
import type { User } from '../types';

interface HeaderProps {
  user: User | null;
  onSignInClick: () => void;
  onSignOutClick: () => void;
  onEditProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onSignInClick,
  onSignOutClick,
  onEditProfileClick,
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0] shadow-xs">
      <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between gap-6">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#047857] flex items-center justify-center text-white shadow-xs">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold text-[#0F172A] tracking-tight">
            EventMate
          </span>
        </div>

        {/* Zone 2: User Profile / Authentication */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-8 w-8 rounded-full bg-emerald-50 border border-[#10B981]/40 flex items-center justify-center text-[#047857] font-semibold text-xs hover:border-[#047857] focus:outline-none transition-colors shadow-xs"
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div
                    onClick={() => { setIsDropdownOpen(false); onEditProfileClick(); }}
                    className="p-3 border-b border-[#F1F5F9] hover:bg-[#F1F5F9] cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-[#0F172A] text-xs truncate">{user.name}</p>
                    <p className="text-[13px] text-[#64748B] truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => { setIsDropdownOpen(false); onSignOutClick(); }}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium rounded-xl mx-1 my-1"
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
              className="text-xs font-medium text-[#0F172A] hover:text-[#047857] py-1.5 px-3.5 rounded-full bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors shadow-xs"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
