import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, LayoutGrid, Table, Calendar, Plus, Sparkles, RefreshCw, X
} from 'lucide-react';

import { Header } from './components/Header';
import { EventCard } from './components/EventCard';
import { EventsTableView } from './components/EventsTableView';
import { RegistrationModal } from './components/RegistrationModal';
import { NewEventModal } from './components/NewEventModal';
import { IdeaGenerator } from './components/IdeaGenerator';
import { Chatbot } from './components/Chatbot';
import { MyEventsModal } from './components/MyEventsModal';
import { SignInModal } from './components/SignInModal';
import { EditProfileModal } from './components/EditProfileModal';
import { ToastContainer } from './components/ToastContainer';

import type { Event, Registration, User, EventCategory, EventStatus, ToastNotification } from './types';
import { EVENTS } from './constants';
import { initAuth, signOutUser } from './services/authService';

export default function App() {
  // Navigation active view ('events' or 'ideation')
  const [activeView, setActiveView] = useState<'events' | 'ideation'>('events');

  // Events state with localStorage fallback to default rich sample events
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const savedEvents = localStorage.getItem('eventmate-events-v2') || localStorage.getItem('eventmate-events');
      if (savedEvents) {
        const parsed = JSON.parse(savedEvents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return EVENTS;
    } catch (error) {
      console.error("Could not parse events from localStorage", error);
      return EVENTS;
    }
  });

  // Current user state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('eventmate-user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Modals state
  const [managedEvent, setManagedEvent] = useState<Event | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isMyEventsModalOpen, setIsMyEventsModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Search, filter & view state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'attendees' | 'title'>('date-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Toasts state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser) => {
        setCurrentUser(authUser);
        localStorage.setItem('eventmate-user', JSON.stringify(authUser));
      },
      () => {
        // Auth session ended
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Sync events to local storage
  useEffect(() => {
    localStorage.setItem('eventmate-events-v2', JSON.stringify(events));
  }, [events]);

  // Overall analytics metrics
  const totalEvents = events.length;
  const totalRegistrations = useMemo(() => {
    return events.reduce((sum, e) => sum + (e.registrations?.length || 0), 0);
  }, [events]);

  const totalCheckedIn = useMemo(() => {
    return events.reduce((sum, e) => sum + (e.registrations?.filter(r => r.checkedIn)?.length || 0), 0);
  }, [events]);

  // Filtered & Sorted events
  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = ev.title.toLowerCase().includes(q);
          const matchesDesc = (ev.description || '').toLowerCase().includes(q);
          const matchesLoc = (ev.location || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesLoc) return false;
        }

        if (selectedCategory !== 'All' && ev.category !== selectedCategory) {
          return false;
        }

        if (selectedStatus !== 'All' && ev.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-asc') {
          return (a.date || '').localeCompare(b.date || '');
        } else if (sortBy === 'date-desc') {
          return (b.date || '').localeCompare(a.date || '');
        } else if (sortBy === 'attendees') {
          return (b.registrations?.length || 0) - (a.registrations?.length || 0);
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [events, searchQuery, selectedCategory, selectedStatus, sortBy]);

  // Event handlers
  const handleOpenManageModal = (event: Event) => {
    setManagedEvent(event);
    setIsManageModalOpen(true);
  };

  const handleCloseManageModal = () => {
    setIsManageModalOpen(false);
    setManagedEvent(null);
  };

  const handleDeleteEvent = (eventId: number) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    if (managedEvent?.id === eventId) {
      handleCloseManageModal();
    }
  };

  const handleCreateEvent = (newEvent: Event) => {
    setEvents(prev => [newEvent, ...prev]);
    addToast(`Created "${newEvent.title}"`);
  };

  const handleAddGeneratedEvent = (
    title: string, 
    description: string, 
    category: EventCategory = 'Conference',
    capacity: number = 100
  ) => {
    const newEvent: Event = {
      id: Date.now(),
      title,
      description,
      date: '2026-12-15',
      time: '10:00 AM - 04:00 PM',
      location: 'Main Auditorium / Hybrid',
      isVirtual: false,
      category,
      status: 'Draft',
      capacity,
      registrations: [],
      agenda: []
    };
    setEvents(prev => [newEvent, ...prev]);
    setActiveView('events');
    addToast(`"${title}" added to your events list`);
  };

  const handleSaveEvent = (updatedEvent: Event) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    setManagedEvent(updatedEvent);
  };

  const handleRegisterAttendee = (attendee: Omit<Registration, 'id'>) => {
    if (!managedEvent) return;
    const newReg: Registration = {
      ...attendee,
      id: Date.now(),
      checkedIn: attendee.checkedIn ?? false,
      registeredAt: attendee.registeredAt || new Date().toISOString().split('T')[0],
    };
    const updated = {
      ...managedEvent,
      registrations: [...(managedEvent.registrations || []), newReg],
    };
    handleSaveEvent(updated);
  };

  const handleToggleCheckIn = (eventId: number, attendeeId: number) => {
    setEvents(prev => prev.map(event => {
      if (event.id !== eventId) return event;
      const updatedRegs = (event.registrations || []).map(r => {
        if (r.id !== attendeeId) return r;
        return { ...r, checkedIn: !r.checkedIn };
      });
      const updatedEvent = { ...event, registrations: updatedRegs };
      if (managedEvent?.id === eventId) {
        setManagedEvent(updatedEvent);
      }
      return updatedEvent;
    }));
  };

  const handleRemoveAttendee = (eventId: number, attendeeId: number) => {
    setEvents(prev => prev.map(event => {
      if (event.id !== eventId) return event;
      const updatedRegs = (event.registrations || []).filter(r => r.id !== attendeeId);
      const updatedEvent = { ...event, registrations: updatedRegs };
      if (managedEvent?.id === eventId) {
        setManagedEvent(updatedEvent);
      }
      return updatedEvent;
    }));
    addToast('Attendee removed', 'info');
  };

  const handleResetSampleEvents = () => {
    if (confirm('Reset to default sample events?')) {
      setEvents(EVENTS);
      localStorage.setItem('eventmate-events-v2', JSON.stringify(EVENTS));
      addToast('Reset to default events', 'info');
    }
  };

  const handleSignIn = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('eventmate-user', JSON.stringify(user));
    setIsSignInModalOpen(false);
    addToast(`Signed in as ${user.name}`);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.warn("Sign out note:", e);
    }
    setCurrentUser(null);
    localStorage.removeItem('eventmate-user');
    addToast('Signed out', 'info');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('eventmate-user', JSON.stringify(updatedUser));
    setIsEditProfileModalOpen(false);
    addToast('Profile updated');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'All' || selectedStatus !== 'All';

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Streamlined Executive Header */}
      <Header
        user={currentUser}
        activeView={activeView}
        onViewChange={setActiveView}
        onNewEventClick={() => setIsNewEventModalOpen(true)}
        onMyEventsClick={() => setIsMyEventsModalOpen(true)}
        onSignInClick={() => setIsSignInModalOpen(true)}
        onSignOutClick={handleSignOut}
        onEditProfileClick={() => setIsEditProfileModalOpen(true)}
        activeEventCount={totalEvents}
      />

      <main className="container mx-auto px-4 lg:px-8 py-7 flex-grow">
        {/* VIEW 1: EVENTS DASHBOARD */}
        {activeView === 'events' && (
          <div className="space-y-6">
            {/* Page Title & Quiet Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Events</h1>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span className="font-mono tabular-nums">{totalEvents} total</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono tabular-nums">{totalRegistrations} registered</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono tabular-nums text-emerald-400">{totalCheckedIn} checked in</span>
                </div>
              </div>

              <button
                onClick={handleResetSampleEvents}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 self-start sm:self-auto transition-colors"
                title="Reset to default sample events"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset demo data</span>
              </button>
            </div>

            {/* Clean Single-Row Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-grow max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search events..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters & View Mode */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Conference">Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Meetup">Meetup</option>
                  <option value="Webinar">Webinar</option>
                  <option value="Networking">Networking</option>
                  <option value="Executive">Executive</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                </select>

                {/* Grid / Table Toggle */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Grid view"
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'table'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Table view"
                    aria-label="Table view"
                  >
                    <Table className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Events Content Area */}
            {filteredEvents.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEditClick={handleOpenManageModal}
                      onDeleteClick={handleDeleteEvent}
                      onToast={addToast}
                    />
                  ))}
                </div>
              ) : (
                <div className="pt-1">
                  <EventsTableView
                    events={filteredEvents}
                    onEditClick={handleOpenManageModal}
                    onDeleteClick={handleDeleteEvent}
                    onToast={addToast}
                  />
                </div>
              )
            ) : (
              <div className="text-center py-20 border border-dashed border-slate-800/80 rounded-xl bg-slate-900/20">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2.5" />
                <h3 className="text-sm font-semibold text-white mb-1">No matching events</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
                  {hasActiveFilters
                    ? 'No events match your current search or filter filters.'
                    : 'Get started by creating your first event or brainstorming ideas with AI.'}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedStatus('All');
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setIsNewEventModalOpen(true)}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                    >
                      Create Event
                    </button>
                    <button
                      onClick={() => setActiveView('ideation')}
                      className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Brainstorm Ideas</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: DEDICATED AI IDEATION STUDIO */}
        {activeView === 'ideation' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>AI Ideation Studio</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Brainstorm themes, explore concepts, and add them directly to your dashboard.
                </p>
              </div>

              <button
                onClick={() => setActiveView('events')}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
              >
                ← Back to Events
              </button>
            </div>

            <IdeaGenerator 
              onEventGenerated={handleAddGeneratedEvent}
              onToast={addToast}
            />
          </div>
        )}
      </main>

      {/* Operations & Management Modal */}
      {managedEvent && (
        <RegistrationModal
          isOpen={isManageModalOpen}
          onClose={handleCloseManageModal}
          event={managedEvent}
          onSave={handleSaveEvent}
          onRegister={handleRegisterAttendee}
          onToggleCheckIn={handleToggleCheckIn}
          onRemoveAttendee={handleRemoveAttendee}
          currentUser={currentUser}
          onToast={addToast}
        />
      )}

      {/* New Event Modal */}
      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onCreate={handleCreateEvent}
      />

      {/* Portfolio Overview Modal */}
      <MyEventsModal
        isOpen={isMyEventsModalOpen}
        onClose={() => setIsMyEventsModalOpen(false)}
        events={events}
        onSelectEvent={handleOpenManageModal}
      />

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSignIn={handleSignIn}
      />

      {/* Edit Profile Modal */}
      {currentUser && (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          user={currentUser}
          onSave={handleUpdateUser}
        />
      )}

      {/* Floating Grounded Chatbot */}
      <Chatbot 
        availableEvents={events} 
        onToast={addToast} 
      />

      {/* Toast Feedback Notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
      />
    </div>
  );
}
