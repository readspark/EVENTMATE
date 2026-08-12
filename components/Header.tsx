
import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';

const ClipboardListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

interface HeaderProps {
    user: User | null;
    onMyEventsClick: () => void;
    onSignInClick: () => void;
    onSignOutClick: () => void;
    onEditProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onMyEventsClick, onSignInClick, onSignOutClick, onEditProfileClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
    
  const handleSignOut = () => {
    setIsDropdownOpen(false);
    onSignOutClick();
  }
  
  const handleEditProfile = () => {
    setIsDropdownOpen(false);
    onEditProfileClick();
  }

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-700 shadow-lg">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <ClipboardListIcon />
            <h1 className="text-2xl font-bold text-white tracking-tight">EventMate</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onMyEventsClick}
            className="hidden sm:block bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition-colors duration-300"
          >
            My Events
          </button>
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                  <div
                    onClick={handleEditProfile} 
                    className="p-4 border-b border-slate-700 hover:bg-slate-700 cursor-pointer"
                  >
                    <p className="font-medium text-white truncate">{user.name}</p>
                    <p className="text-sm text-slate-400 truncate">{user.email}</p>
                    <p className="text-xs text-slate-500 mt-2">Click to edit profile</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-600 hover:text-white transition-colors duration-150"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-colors duration-300"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
