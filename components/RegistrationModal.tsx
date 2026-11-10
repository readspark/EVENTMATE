import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, MapPin, Users, Download, CalendarPlus, 
  CheckCircle2, Circle, Plus, Trash2, Check, 
  Mail, ExternalLink, Loader2
} from 'lucide-react';
import type { Event, Registration, User, EventCategory, EventStatus, AgendaItem } from '../types';
import { generateReminderEmail } from '../services/geminiService';
import { downloadIcsCalendarFile } from '../services/calendarService';
import { ReminderModal } from './ReminderModal';
import { formatIndianDate, getEventStatus } from '../utils/dateUtils';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onSave: (event: Event) => void;
  onRegister: (attendee: Omit<Registration, 'id'>) => void;
  onToggleCheckIn: (eventId: number, attendeeId: number) => void;
  onRemoveAttendee: (eventId: number, attendeeId: number) => void;
  currentUser: User | null;
  onToast?: (message: string) => void;
}

type TabType = 'details' | 'attendees' | 'agenda';

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
  onRegister,
  onToggleCheckIn,
  onRemoveAttendee,
  currentUser,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [formData, setFormData] = useState<Event>(event);
  
  // Attendee registration state
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [attendeeSearch, setAttendeeSearch] = useState('');

  // Agenda items state
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(event.agenda || []);
  const [newAgendaTime, setNewAgendaTime] = useState('');
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaLead, setNewAgendaLead] = useState('');

  // Reminder Modal state
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderContent, setReminderContent] = useState<{ subject: string; body: string } | null>(null);
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);

  // Save status indicator
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setFormData(event);
    setAgendaItems(event.agenda || []);
  }, [event]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    const updated: Event = {
      ...formData,
      agenda: agendaItems,
      capacity: Number(formData.capacity) || 100,
    };
    setTimeout(() => {
      onSave(updated);
      setSaveStatus('saved');
      if (onToast) onToast('Event details updated successfully');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 350);
  };

  const handleRegisterAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttendeeName.trim() || !newAttendeeEmail.trim()) return;
    onRegister({
      name: newAttendeeName.trim(),
      email: newAttendeeEmail.trim(),
      checkedIn: false,
      registeredAt: formatIndianDate(new Date()),
    });
    setNewAttendeeName('');
    setNewAttendeeEmail('');
    if (onToast) onToast(`Registered attendee: ${newAttendeeName}`);
  };

  const handleExportCsv = () => {
    if (!event.registrations || event.registrations.length === 0) return;
    const fileName = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_attendees.csv`;
    const csvHeader = 'Name,Email,CheckedIn,RegisteredDate\n';
    const csvRows = event.registrations
      .map(reg => `"${reg.name.replace(/"/g, '""')}","${reg.email.replace(/"/g, '""')}","${reg.checkedIn ? 'Yes' : 'No'}","${reg.registeredAt || ''}"`)
      .join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onToast) onToast(`Exported ${event.registrations.length} attendees to CSV`);
  };

  const handleExportIcs = () => {
    const success = downloadIcsCalendarFile(formData);
    if (success && onToast) onToast(`Downloaded .ics invite for ${formData.title}`);
  };

  const handleAddAgendaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgendaTitle.trim() || !newAgendaTime.trim()) return;
    const newItem: AgendaItem = {
      id: `ag-custom-${Date.now()}`,
      time: newAgendaTime.trim(),
      title: newAgendaTitle.trim(),
      speakerOrLead: newAgendaLead.trim() || undefined,
    };
    const updatedAgenda = [...agendaItems, newItem];
    setAgendaItems(updatedAgenda);
    onSave({ ...formData, agenda: updatedAgenda });
    setNewAgendaTime('');
    setNewAgendaTitle('');
    setNewAgendaLead('');
  };

  const handleDeleteAgendaItem = (id: string) => {
    const updatedAgenda = agendaItems.filter(item => item.id !== id);
    setAgendaItems(updatedAgenda);
    onSave({ ...formData, agenda: updatedAgenda });
  };

  const handleOpenReminderModal = async () => {
    setIsGeneratingReminder(true);
    const content = await generateReminderEmail(event, currentUser?.name);
    setReminderContent(content);
    setIsGeneratingReminder(false);
    setIsReminderModalOpen(true);
  };

  const filteredAttendees = (event.registrations || []).filter(r => 
    r.name.toLowerCase().includes(attendeeSearch.toLowerCase()) || 
    r.email.toLowerCase().includes(attendeeSearch.toLowerCase())
  );

  const checkedInCount = (event.registrations || []).filter(r => r.checkedIn).length;
  const totalRegistrations = event.registrations?.length || 0;

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden">
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span className="text-indigo-400 font-semibold">{formData.category || 'Event'}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className={
                  getEventStatus(formData) === 'In Progress' 
                    ? 'text-emerald-400 font-semibold' 
                    : getEventStatus(formData) === 'Completed'
                    ? 'text-slate-500'
                    : 'text-indigo-300'
                }>
                  {getEventStatus(formData)}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono tabular-nums">{formatIndianDate(formData.date)}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {formData.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center border-b border-slate-800 text-sm bg-slate-900/50">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 text-center py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'details'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Logistics & Details
            </button>
            <button
              onClick={() => setActiveTab('attendees')}
              className={`flex-1 text-center py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'attendees'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Attendees & Check-In</span>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                ({checkedInCount}/{totalRegistrations})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex-1 text-center py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTab === 'agenda'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Run-of-Show Agenda</span>
              <span className="text-xs font-mono tabular-nums text-slate-400">({agendaItems.length})</span>
            </button>
          </div>

          {/* Modal Tab Body */}
          <div className="p-6 overflow-y-auto flex-grow space-y-6">
            {/* Tab 1: Logistics & Details */}
            {activeTab === 'details' && (
              <form onSubmit={handleSaveDetails} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="category" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category || 'Conference'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      Status
                    </label>
                    <div className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-white text-sm font-medium flex items-center justify-between h-[38px]">
                      <span className={
                        getEventStatus(formData) === 'In Progress' 
                          ? 'text-emerald-400 font-semibold' 
                          : getEventStatus(formData) === 'Completed'
                          ? 'text-slate-400 font-medium'
                          : 'text-indigo-300 font-medium'
                      }>
                        {getEventStatus(formData)}
                      </span>
                      <span className="text-[10px] text-slate-500">Auto-calculated</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="capacity" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity || 100}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min={1}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="date" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Date (DD/MM/YYYY)
                    </label>
                    <input
                      type="text"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      placeholder="e.g. 24/11/2026"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="time" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Time Range
                    </label>
                    <input
                      type="text"
                      id="time"
                      name="time"
                      value={formData.time || ''}
                      onChange={handleChange}
                      placeholder="e.g. 09:00 AM - 05:00 PM"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="location" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Location / Venue
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!formData.isVirtual}
                        onChange={(e) => setFormData(prev => ({ ...prev, isVirtual: e.target.checked }))}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Virtual / Online Event</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={formData.isVirtual ? 'e.g. https://zoom.us/j/...' : 'e.g. Moscone Center, San Francisco, CA'}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Description & Brief
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleExportIcs}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Download .ICS Calendar Invite</span>
                  </button>

                  <button
                    type="submit"
                    disabled={saveStatus !== 'idle'}
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saveStatus === 'saved' && <Check className="w-4 h-4 text-emerald-400" />}
                    <span>{saveStatus === 'saved' ? 'Saved' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Attendees & Check-In */}
            {activeTab === 'attendees' && (
              <div className="space-y-6">
                {/* Roster Controls Strip */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div>
                    <div className="text-xs text-slate-400">Total Check-in Progress</div>
                    <div className="text-lg font-bold text-white font-mono tabular-nums">
                      {checkedInCount} <span className="text-slate-500 text-sm font-normal">/ {totalRegistrations} checked in ({totalRegistrations ? Math.round((checkedInCount / totalRegistrations) * 100) : 0}%)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportCsv}
                      disabled={!totalRegistrations}
                      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 disabled:opacity-50 transition-colors"
                      title="Download attendee roster CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                    <button
                      onClick={handleOpenReminderModal}
                      disabled={!totalRegistrations || isGeneratingReminder}
                      className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
                    >
                      {isGeneratingReminder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                      <span>Send Reminders</span>
                    </button>
                  </div>
                </div>

                {/* Quick Add Attendee Form */}
                <form onSubmit={handleRegisterAttendee} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={newAttendeeName}
                      onChange={(e) => setNewAttendeeName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newAttendeeEmail}
                      onChange={(e) => setNewAttendeeEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-full transition-colors h-[38px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register</span>
                  </button>
                </form>

                {/* Search Attendees */}
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="text"
                    value={attendeeSearch}
                    onChange={(e) => setAttendeeSearch(e.target.value)}
                    placeholder="Search attendee by name or email..."
                    className="w-full px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500"
                  />
                </div>

                {/* Attendee Roster List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {filteredAttendees.length > 0 ? (
                    filteredAttendees.map((reg) => (
                      <div
                        key={reg.id}
                        className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onToggleCheckIn(event.id, reg.id)}
                            className={`p-1 rounded transition-colors ${
                              reg.checkedIn ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-slate-400'
                            }`}
                            title={reg.checkedIn ? 'Mark as Not Checked In' : 'Check In Attendee'}
                          >
                            {reg.checkedIn ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>
                          <div>
                            <div className="text-sm font-semibold text-white leading-tight flex items-center gap-2">
                              <span>{reg.name}</span>
                              {reg.checkedIn && (
                                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                                  Checked In
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">{reg.email}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveAttendee(event.id, reg.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                          title="Remove attendee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                      No registered attendees match your criteria.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Run-of-Show Agenda */}
            {activeTab === 'agenda' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>Run-of-Show Timeline</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Structure minute-by-minute programming, speaker slots, and breaks.
                    </p>
                  </div>
                </div>

                {/* Add Manual Agenda Item */}
                <form onSubmit={handleAddAgendaItem} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      value={newAgendaTime}
                      onChange={(e) => setNewAgendaTime(e.target.value)}
                      placeholder="09:30 AM"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Session Title
                    </label>
                    <input
                      type="text"
                      value={newAgendaTitle}
                      onChange={(e) => setNewAgendaTitle(e.target.value)}
                      placeholder="e.g. Opening Keynote"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                      required
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Lead / Speaker
                    </label>
                    <input
                      type="text"
                      value={newAgendaLead}
                      onChange={(e) => setNewAgendaLead(e.target.value)}
                      placeholder="e.g. Host"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1 py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-full border border-slate-700 h-[33px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>

                {/* Timeline Items */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {agendaItems.length > 0 ? (
                    agendaItems.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-xs font-semibold text-indigo-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 whitespace-nowrap shrink-0">
                            {item.time}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-white">{item.title}</div>
                            {item.speakerOrLead && (
                              <div className="text-xs text-slate-400 mt-0.5">
                                Speaker: <span className="text-slate-300 font-medium">{item.speakerOrLead}</span>
                              </div>
                            )}
                            {item.notes && (
                              <div className="text-xs text-slate-500 mt-0.5">{item.notes}</div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteAgendaItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded"
                          title="Delete agenda slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
                      <Clock className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">No timeline segments configured yet.</p>
                      <p className="text-[11px] text-slate-500 mt-1">Add session slots, keynotes, and breaks using the form above.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {reminderContent && (
        <ReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => {
            setIsReminderModalOpen(false);
            setReminderContent(null);
          }}
          event={event}
          initialContent={reminderContent}
        />
      )}
    </>
  );
};