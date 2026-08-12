
import React from 'react';
import type { Event } from '../types';

interface MyEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
}

const ClipboardCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 0a2 2 0 00-2-2h-2a2 2 0 00-2 2m6 0a2 2 0 012 2h-4a2 2 0 012-2zm-3 7l2 2 4-4" />
    </svg>
);

export const MyEventsModal: React.FC<MyEventsModalProps> = ({ isOpen, onClose, events }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl max-w-md w-full p-8 relative transform transition-all duration-300 ease-in-out scale-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">My Planned Events</h2>
        
        {events.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto">
                {events.map(event => (
                    <div key={event.id} className="bg-slate-700 p-4 rounded-lg flex items-center">
                        <ClipboardCheckIcon />
                        <div>
                            <p className="font-bold text-white">{event.title}</p>
                            <p className="text-sm text-slate-300">{event.date} - {event.location}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-slate-400 text-center py-8">You haven't planned any events yet.</p>
        )}

        <button onClick={onClose} className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
            Close
        </button>
      </div>
    </div>
  );
};
