import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutGrid, Table, Calendar, Plus, Sparkles, RefreshCw
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
import { DailyCalendarModal } from './components/DailyCalendarModal';
import { ToastContainer } from './components/ToastContainer';

import type { Event, Registration, User, EventCategory, EventStatus, ToastNotification } from './types';
import { initAuth, signOutUser } from './services/authService';
import { 
  testConnection, 
  subscribeToUserEvents, 
  saveEventToCloud, 
  deleteEventFromCloud, 
  migrateLocalToCloud 
} from './services/firebaseService';
import { parseIndianDate, formatIndianDate } from './utils/dateUtils';

export default function App() {
  // Navigation active view ('events' or 'ideation')
  const [activeView, setActiveView] = useState<'events' | 'ideation'>('events');

  // Events state defaults to empty list (no pre-added mock events)
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const savedEvents = localStorage.getItem('eventmate-events-v3');
      if (savedEvents) {
        const parsed = JSON.parse(savedEvents);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch (error) {
      console.error("Could not parse events from localStorage", error);
      return [];
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
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [pendingNewEvent, setPendingNewEvent] = useState<Event | null>(null);

  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Toast pop-up notifications disabled
  const addToast = (_message?: string, _type?: string) => {};
  const removeToast = (_id?: string) => {};

  // Validate Firestore connection on boot
  useEffect(() => {
    testConnection();
  }, []);

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

  // Real-time Firestore sync: when user signs in, load events across devices & listen live
  useEffect(() => {
    if (!currentUser) return;

    // Migrate any pre-existing local events to the user's cloud account
    const localSaved = localStorage.getItem('eventmate-events-v3');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          migrateLocalToCloud(currentUser, parsed);
        }
      } catch (err) {
        console.warn("Local sync check notice:", err);
      }
    }

    // Subscribe to real-time events for this user (cross-device sync)
    const unsubscribe = subscribeToUserEvents(currentUser, (cloudEvents) => {
      setEvents(cloudEvents);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Sync events to local storage
  useEffect(() => {
    localStorage.setItem('eventmate-events-v3', JSON.stringify(events));
  }, [events]);

  // Overall analytics metrics
  const totalEvents = events.length;
  const totalRegistrations = useMemo(() => {
    return events.reduce((sum, e) => sum + (e.registrations?.length || 0), 0);
  }, [events]);

  const totalCheckedIn = useMemo(() => {
    return events.reduce((sum, e) => sum + (e.registrations?.filter(r => r.checkedIn)?.length || 0), 0);
  }, [events]);

  // Sorted events (chronological order)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      return parseIndianDate(a.date).getTime() - parseIndianDate(b.date).getTime();
    });
  }, [events]);

  // Event handlers
  const handleOpenManageModal = (event: Event) => {
    setManagedEvent(event);
    setIsManageModalOpen(true);
  };

  const handleCloseManageModal = () => {
    setIsManageModalOpen(false);
    setManagedEvent(null);
  };

  const handleDeleteEvent = async (eventId: string | number) => {
    setEvents(prev => prev.filter(e => String(e.id) !== String(eventId)));
    if (managedEvent && String(managedEvent.id) === String(eventId)) {
      handleCloseManageModal();
    }
    if (currentUser) {
      await deleteEventFromCloud(eventId);
    }
  };

  const handleCreateEvent = async (newEvent: Event) => {
    const eventWithMetadata: Event = {
      ...newEvent,
      id: String(newEvent.id),
      ownerId: currentUser?.uid,
      creatorEmail: currentUser?.email,
      createdAt: newEvent.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEvents(prev => [eventWithMetadata, ...prev.filter(e => String(e.id) !== String(eventWithMetadata.id))]);
    if (currentUser) {
      await saveEventToCloud(currentUser, eventWithMetadata);
    }
    addToast(`Created "${newEvent.title}"`);
  };

  const handleAddGeneratedEvent = async (
    title: string, 
    description: string, 
    category: EventCategory = 'Conference',
    capacity: number = 100
  ) => {
    const newEvent: Event = {
      id: String(Date.now()),
      title,
      description,
      date: '15/12/2026',
      time: '10:00 AM - 04:00 PM',
      location: 'Main Auditorium / Hybrid',
      isVirtual: false,
      category,
      status: 'Upcoming',
      capacity,
      registrations: [],
      agenda: [],
      ownerId: currentUser?.uid,
      creatorEmail: currentUser?.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await handleCreateEvent(newEvent);
    setActiveView('events');
    addToast(`"${title}" added to your events list`);
  };

  const handleSaveEvent = async (updatedEvent: Event) => {
    const formatted: Event = {
      ...updatedEvent,
      id: String(updatedEvent.id),
      ownerId: updatedEvent.ownerId || currentUser?.uid,
      creatorEmail: updatedEvent.creatorEmail || currentUser?.email,
      updatedAt: new Date().toISOString()
    };
    setEvents(prev => prev.map(e => String(e.id) === String(formatted.id) ? formatted : e));
    setManagedEvent(formatted);

    if (currentUser) {
      await saveEventToCloud(currentUser, formatted);
    }
  };

  const handleRegisterAttendee = async (attendee: Omit<Registration, 'id'>) => {
    if (!managedEvent) return;
    const newReg: Registration = {
      ...attendee,
      id: Date.now(),
      checkedIn: attendee.checkedIn ?? false,
      registeredAt: attendee.registeredAt || formatIndianDate(new Date()),
    };
    const updated = {
      ...managedEvent,
      registrations: [...(managedEvent.registrations || []), newReg],
    };
    await handleSaveEvent(updated);
  };

  const handleToggleCheckIn = async (eventId: string | number, attendeeId: number) => {
    const targetEvent = events.find(e => String(e.id) === String(eventId));
    if (!targetEvent) return;

    const updatedRegs = (targetEvent.registrations || []).map(r => {
      if (r.id !== attendeeId) return r;
      return { ...r, checkedIn: !r.checkedIn };
    });
    const updatedEvent: Event = { ...targetEvent, registrations: updatedRegs };
    await handleSaveEvent(updatedEvent);
  };

  const handleRemoveAttendee = async (eventId: string | number, attendeeId: number) => {
    const targetEvent = events.find(e => String(e.id) === String(eventId));
    if (!targetEvent) return;

    const updatedRegs = (targetEvent.registrations || []).filter(r => r.id !== attendeeId);
    const updatedEvent: Event = { ...targetEvent, registrations: updatedRegs };
    await handleSaveEvent(updatedEvent);
    addToast('Attendee removed', 'info');
  };

  const handleClearAllEvents = () => {
    if (confirm('Clear all events from dashboard?')) {
      setEvents([]);
      localStorage.setItem('eventmate-events-v3', JSON.stringify([]));
      addToast('All events cleared', 'info');
    }
  };

  const handleRequireSignInForEvent = (newEvent: Event) => {
    setPendingNewEvent(newEvent);
    setIsSignInModalOpen(true);
  };

  const handleSignIn = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('eventmate-user', JSON.stringify(user));
    setIsSignInModalOpen(false);

    if (pendingNewEvent) {
      handleCreateEvent(pendingNewEvent);
      setPendingNewEvent(null);
      setIsNewEventModalOpen(false);
    }
  };

  useEffect(() => {
    if (currentUser && pendingNewEvent) {
      handleCreateEvent(pendingNewEvent);
      setPendingNewEvent(null);
      setIsNewEventModalOpen(false);
      setIsSignInModalOpen(false);
    }
  }, [currentUser, pendingNewEvent]);

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.warn("Sign out note:", e);
    }
    setCurrentUser(null);
    setEvents([]);
    localStorage.removeItem('eventmate-user');
    localStorage.removeItem('eventmate-events-v3');
    addToast('Signed out', 'info');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('eventmate-user', JSON.stringify(updatedUser));
    setIsEditProfileModalOpen(false);
    addToast('Profile updated');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-[#0F172A] flex flex-col selection:bg-[#047857] selection:text-white">
      {/* Streamlined Executive Header */}
      <Header
        user={currentUser}
        onSignInClick={() => setIsSignInModalOpen(true)}
        onSignOutClick={handleSignOut}
        onEditProfileClick={() => setIsEditProfileModalOpen(true)}
      />

      <main className="container mx-auto px-4 lg:px-8 py-7 flex-grow">
        {/* Page Title, Description & Action Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#E2E8F0]">
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Events</h1>
            <p className="text-xs text-[#64748B] mt-0.5">smart event management</p>
          </div>

          {/* Action Controls Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 'events and brainstorm' buttons beside the calender button */}
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-full border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setActiveView('events')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 flex items-center gap-1.5 select-none transition-colors ${
                  activeView === 'events'
                    ? 'bg-white text-[#047857] font-semibold border border-[#10B981]/30 shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <span>Events</span>
                <span className="font-mono text-[13px] text-[#047857] font-semibold tabular-nums">
                  {totalEvents}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('ideation')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap shrink-0 flex items-center gap-1.5 select-none transition-colors ${
                  activeView === 'ideation'
                    ? 'bg-white text-[#047857] font-semibold border border-[#10B981]/30 shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span>Brainstorm</span>
              </button>
            </div>

            {/* Calendar Button */}
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="p-2.5 rounded-full bg-white border border-[#E2E8F0] text-[#0F172A] hover:text-[#047857] hover:bg-[#F1F5F9] transition-colors shadow-xs"
              title="Open Daily Calendar"
              aria-label="Open Daily Calendar"
            >
              <Calendar className="w-4 h-4" />
            </button>

            {/* View of the events (Grid / Table toggle) */}
            <div className="flex items-center bg-[#E2E8F0] border border-[#CBD5E1] rounded-full p-1">
              <button
                onClick={() => {
                  if (activeView !== 'events') setActiveView('events');
                  setViewMode('grid');
                }}
                className={`p-1.5 rounded-full transition-colors ${
                  viewMode === 'grid' && activeView === 'events'
                    ? 'bg-white text-[#047857] shadow-xs font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (activeView !== 'events') setActiveView('events');
                  setViewMode('table');
                }}
                className={`p-1.5 rounded-full transition-colors ${
                  viewMode === 'table' && activeView === 'events'
                    ? 'bg-white text-[#047857] shadow-xs font-semibold'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
                title="Table view"
                aria-label="Table view"
              >
                <Table className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Shift new event button beside the view of the events */}
            <button
              onClick={() => setIsNewEventModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#047857] hover:bg-[#065f46] text-white text-xs font-medium py-2 px-4 rounded-full shadow-xs transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Event</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: EVENTS DASHBOARD */}
        {activeView === 'events' && (
          <div className="space-y-6">

            {/* Events Content Area */}
            {sortedEvents.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                  {sortedEvents.map((event) => (
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
                    events={sortedEvents}
                    onEditClick={handleOpenManageModal}
                    onDeleteClick={handleDeleteEvent}
                    onToast={addToast}
                  />
                </div>
              )
            ) : (
              <div className="text-center py-20 border border-dashed border-[#CBD5E1] rounded-2xl bg-white/70 shadow-xs">
                <Calendar className="w-8 h-8 text-[#64748B] mx-auto mb-2.5" />
                <h3 className="text-sm font-semibold text-[#0F172A] mb-4">No events yet</h3>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setIsNewEventModalOpen(true)}
                    className="px-5 py-2.5 text-xs font-semibold rounded-full bg-[#047857] hover:bg-[#065f46] text-white shadow-xs transition-all"
                  >
                    Create Event
                  </button>
                  <button
                    onClick={() => setActiveView('ideation')}
                    className="px-5 py-2.5 text-xs font-medium rounded-full bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1] flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
                    <span>Brainstorm Ideas</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: DEDICATED AI IDEATION STUDIO */}
        {activeView === 'ideation' && (
          <div className="max-w-4xl mx-auto space-y-6">
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
        onClose={() => {
          setIsNewEventModalOpen(false);
          setPendingNewEvent(null);
        }}
        onCreate={handleCreateEvent}
        currentUser={currentUser}
        onRequireSignIn={handleRequireSignInForEvent}
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

      <DailyCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        events={events}
      />
    </div>
  );
}
