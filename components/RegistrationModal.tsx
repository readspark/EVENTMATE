import React, { useState, useEffect } from 'react';
import type { Event, Registration, User } from '../types';
import { generateReminderEmail } from '../services/geminiService';
import { ReminderModal } from './ReminderModal';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onSave: (event: Event) => void;
  onRegister: (attendee: Omit<Registration, 'id'>) => void;
  currentUser: User | null;
}

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, event, onSave, onRegister, currentUser }) => {
  const [formData, setFormData] = useState<Event>(event);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  
  // New state for reminder feature
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);
  const [isReminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderContent, setReminderContent] = useState<{ subject: string; body: string } | null>(null);

  // State for save button UX
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    // Update form data if the event prop changes
    setFormData(event);
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveStatus !== 'idle') return;

    setSaveStatus('saving');
    // Simulate a short delay for better UX, then save.
    setTimeout(() => {
        onSave(formData);
        setSaveStatus('saved');
        setTimeout(() => {
            setSaveStatus('idle');
        }, 2000); // Revert to idle after 2 seconds
    }, 500);
  };
  
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (attendeeName.trim() && attendeeEmail.trim()) {
      onRegister({ name: attendeeName, email: attendeeEmail });
      setAttendeeName('');
      setAttendeeEmail('');
    }
  };

  const handleGenerateReminder = async () => {
    setIsGeneratingReminder(true);
    const content = await generateReminderEmail(event, currentUser?.name);
    setReminderContent(content);
    setIsGeneratingReminder(false);
    setReminderModalOpen(true);
  };

  const handleExportToCsv = () => {
    if (!event.registrations || event.registrations.length === 0) {
      return;
    }

    const fileName = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_attendees.csv`;
    const csvHeader = 'Name,Email\n';
    const csvRows = event.registrations
      .map(reg => `"${reg.name.replace(/"/g, '""')}","${reg.email.replace(/"/g, '""')}"`)
      .join('\n');
    const csvContent = csvHeader + csvRows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const getSaveButtonClass = () => {
    switch (saveStatus) {
      case 'saving':
        return 'bg-slate-500 cursor-not-allowed';
      case 'saved':
        return 'bg-green-600 cursor-not-allowed';
      case 'idle':
      default:
        return 'bg-slate-600 hover:bg-slate-500';
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full p-8 relative transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold mb-6 text-white">Manage Event</h2>
          
          {/* Event Details Form */}
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-2 mb-4">Event Details</h3>
              <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-300">Event Title</label>
                  <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-slate-500 focus:border-slate-500" required />
              </div>
              <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={6} className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-slate-500 focus:border-slate-500" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="date" className="block text-sm font-medium text-slate-300">Date</label>
                      <input type="text" id="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-slate-500 focus:border-slate-500" required />
                  </div>
                  <div>
                      <label htmlFor="location" className="block text-sm font-medium text-slate-300">Location</label>
                      <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-slate-500 focus:border-slate-500" required />
                  </div>
              </div>
              <button 
                type="submit" 
                disabled={saveStatus !== 'idle'}
                className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors duration-200 ${getSaveButtonClass()}`}
              >
                  {saveStatus === 'idle' && 'Save Changes'}
                  {saveStatus === 'saving' && (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                        <span>Saving...</span>
                      </>
                  )}
                  {saveStatus === 'saved' && '✓ Changes Saved!'}
              </button>
          </form>

          <div className="mt-8">
              <div className="flex justify-between items-center border-b border-slate-600 pb-2 mb-4">
                  <h3 className="text-lg font-semibold text-slate-200">Attendees ({event.registrations?.length || 0})</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleExportToCsv}
                      disabled={!event.registrations?.length}
                      className="flex items-center text-sm bg-slate-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 disabled:bg-slate-500/50 disabled:cursor-not-allowed transition-colors"
                      title="Export attendees to a CSV file"
                    >
                      <DownloadIcon />
                      Export CSV
                    </button>
                    <button 
                      onClick={handleGenerateReminder}
                      disabled={!event.registrations?.length || isGeneratingReminder}
                      className="flex items-center text-sm bg-indigo-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 disabled:bg-slate-500/50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isGeneratingReminder ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Generating...
                            </>
                        ) : (
                            <>
                              <MailIcon />
                              Send Reminders
                            </>
                        )}
                    </button>
                  </div>
              </div>
              
              {/* Registration Form */}
              <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-6">
                   <div className="sm:col-span-1">
                      <label htmlFor="attendeeName" className="block text-sm font-medium text-slate-300">Full Name</label>
                      <input type="text" id="attendeeName" value={attendeeName} onChange={(e) => setAttendeeName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-slate-500 focus:border-slate-500" required />
                  </div>
                   <div className="sm:col-span-1">
                      <label htmlFor="attendeeEmail" className="block text-sm font-medium text-slate-300">Email Address</label>
                      <input type="email" id="attendeeEmail" value={attendeeEmail} onChange={(e) => setAttendeeEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-slate-500 focus:border-slate-500" required />
                  </div>
                  <button type="submit" className="w-full sm:w-auto justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      Register Attendee
                  </button>
              </form>

              {/* Attendee List */}
              <div className="space-y-2">
                  {event.registrations?.length > 0 ? (
                      event.registrations.map(reg => (
                          <div key={reg.id} className="bg-slate-700 p-3 rounded-md flex justify-between items-center">
                              <div>
                                  <p className="font-medium text-white">{reg.name}</p>
                                  <p className="text-sm text-slate-400">{reg.email}</p>
                              </div>
                          </div>
                      ))
                  ) : (
                      <p className="text-slate-400 text-center py-4">No attendees have registered yet.</p>
                  )}
              </div>
          </div>
        </div>
      </div>

      {reminderContent && (
        <ReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => {
            setReminderModalOpen(false);
            setReminderContent(null);
          }}
          event={event}
          initialContent={reminderContent}
        />
      )}
    </>
  );
};