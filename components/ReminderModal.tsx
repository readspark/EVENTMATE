import React, { useState, useEffect } from 'react';
import type { Event } from '../types';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  initialContent: {
    subject: string;
    body: string;
  };
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, event, initialContent }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (initialContent) {
      setSubject(initialContent.subject);
      setBody(initialContent.body);
    }
  }, [initialContent, isOpen]);

  const handleSend = () => {
    if (!event.registrations || event.registrations.length === 0) {
      alert('No registered attendees to send reminders to.');
      return;
    }

    const recipientEmails = event.registrations.map(r => r.email).join(',');
    const mailtoLink = `mailto:?bcc=${recipientEmails}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full p-8 relative transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-1 text-white">Generated Event Reminder</h2>
        <p className="text-slate-400 mb-6">Review and edit the AI-generated reminder, then send it to all attendees.</p>
        
        <div className="space-y-4 flex-grow overflow-y-auto pr-2">
            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-300">Subject</label>
                <input 
                    type="text" 
                    id="subject" 
                    name="subject" 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)} 
                    className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-slate-500 focus:border-slate-500" 
                />
            </div>
            <div>
                <label htmlFor="body" className="block text-sm font-medium text-slate-300">Body</label>
                <textarea 
                    id="body" 
                    name="body" 
                    value={body} 
                    onChange={(e) => setBody(e.target.value)} 
                    rows={8} 
                    className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-slate-500 focus:border-slate-500" 
                />
            </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex justify-end items-center space-x-4">
                <button 
                    type="button" 
                    onClick={onClose}
                    className="py-2 px-6 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none"
                >
                    Cancel
                </button>
                <button 
                    type="button"
                    onClick={handleSend}
                    className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
                >
                    Send to All ({event.registrations?.length || 0})
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};