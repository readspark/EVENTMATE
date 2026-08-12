
import React, { useState, useEffect } from 'react';
import type { Event } from '../types';
import { BulletPointDescription } from './BulletPointDescription';

interface EventCardProps {
  event: Event;
  onEditClick: (event: Event) => void;
  onDeleteClick: (eventId: number) => void;
}

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


export const EventCard: React.FC<EventCardProps> = ({ event, onEditClick, onDeleteClick }) => {
  const registrationCount = event.registrations?.length || 0;
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // If the user is in confirmation state, set a timer to revert it.
  useEffect(() => {
    if (!isConfirmingDelete) return;

    const timer = setTimeout(() => {
      setIsConfirmingDelete(false);
    }, 3000); // Revert back to 'Delete' after 3 seconds

    return () => clearTimeout(timer);
  }, [isConfirmingDelete]);

  const handleDeleteButtonClick = () => {
    if (isConfirmingDelete) {
      onDeleteClick(event.id);
    } else {
      setIsConfirmingDelete(true);
    }
  };

  return (
    <div 
        className="bg-slate-800 rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col"
        // Also revert if the mouse leaves the card, which indicates user changed their mind
        onMouseLeave={() => setIsConfirmingDelete(false)}
    >
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
        <div className="text-slate-300 text-sm mb-4 flex-grow line-clamp-3">
            <BulletPointDescription description={event.description} />
        </div>
        <div className="text-sm text-slate-400 space-y-2">
            <div className="flex items-center">
                <CalendarIcon />
                <span>{event.date}</span>
            </div>
            <div className="flex items-center">
                <LocationIcon />
                <span>{event.location}</span>
            </div>
            <div className="flex items-center">
                <UsersIcon />
                <span>{registrationCount} Registered</span>
            </div>
        </div>
      </div>
      <div className="p-4 bg-slate-700/50 grid grid-cols-2 gap-3">
        <button
          onClick={() => onEditClick(event)}
          disabled={isConfirmingDelete}
          className="w-full bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors duration-300 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          Manage
        </button>
        <button
          onClick={handleDeleteButtonClick}
          className={`w-full text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-300 ${
            isConfirmingDelete 
              ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400' 
              : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
          }`}
        >
          {isConfirmingDelete ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </div>
  );
};
