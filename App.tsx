
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EventCard } from './components/EventCard';
import { RegistrationModal } from './components/RegistrationModal';
import { IdeaGenerator } from './components/IdeaGenerator';
import { Chatbot } from './components/Chatbot';
import type { Event, Registration, User } from './types';
import { EVENTS } from './constants';
import { MyEventsModal } from './components/MyEventsModal';
import { SignInModal } from './components/SignInModal';
import { EditProfileModal } from './components/EditProfileModal';

export default function App() {
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const savedEvents = localStorage.getItem('eventmate-events');
      return savedEvents ? JSON.parse(savedEvents) : EVENTS;
    } catch (error) {
      console.error("Could not parse events from localStorage", error);
      return EVENTS;
    }
  });
  const [managedEvent, setManagedEvent] = useState<Event | null>(null);
  const [isManageModalOpen, setManageModalOpen] = useState(false);
  const [isMyEventsModalOpen, setMyEventsModalOpen] = useState(false);
  const [isSignInModalOpen, setSignInModalOpen] = useState(false);
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for a saved user on initial load
    const savedUser = localStorage.getItem('eventmate-user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    // Save events to local storage whenever they change
    localStorage.setItem('eventmate-events', JSON.stringify(events));
  }, [events]);

  const handleManageClick = (event: Event) => {
    setManagedEvent(event);
    setManageModalOpen(true);
  };
  
  const handleDeleteClick = (eventId: number) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
  };

  const handleCloseModal = () => {
    setManageModalOpen(false);
    setManagedEvent(null);
  };

  const addGeneratedEvent = (title: string, description: string) => {
    const newEvent: Event = {
      id: Date.now(),
      title,
      description,
      date: 'Date to be confirmed',
      location: 'Venue to be decided',
      registrations: [],
    };
    setEvents(prevEvents => [newEvent, ...prevEvents]);
  };

  const handleSaveEvent = (updatedEvent: Event) => {
    setEvents(prevEvents => 
        prevEvents.map(event => 
            event.id === updatedEvent.id ? updatedEvent : event
        )
    );
    // Keep the modal open, but with updated data
    setManagedEvent(updatedEvent);
  };

  const handleRegister = (attendee: Omit<Registration, 'id'>) => {
    if (!managedEvent) return;
    
    const newRegistration: Registration = { ...attendee, id: Date.now() };
    
    const updatedEvent = {
        ...managedEvent,
        registrations: [...managedEvent.registrations, newRegistration],
    };

    setManagedEvent(updatedEvent);
    setEvents(prevEvents => 
        prevEvents.map(event => 
            event.id === updatedEvent.id ? updatedEvent : event
        )
    );
  };

  const handleSignIn = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('eventmate-user', JSON.stringify(user));
    setSignInModalOpen(false);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('eventmate-user');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('eventmate-user', JSON.stringify(updatedUser));
    setEditProfileModalOpen(false);
  };


  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white">
      <Header 
        user={currentUser}
        onSignInClick={() => setSignInModalOpen(true)}
        onSignOutClick={handleSignOut}
        onMyEventsClick={() => setMyEventsModalOpen(true)} 
        onEditProfileClick={() => setEditProfileModalOpen(true)}
      />
      <main className="container mx-auto p-4 md:p-8">
        <IdeaGenerator onEventGenerated={addGeneratedEvent}/>

        <div className="mt-12">
          <h2 className="text-3xl font-bold text-white mb-2">My Event Dashboard</h2>
          <p className="text-slate-400 mb-8">Here are all the events you're planning. Add, edit, or remove them as needed.</p>
          
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                <EventCard 
                    key={event.id} 
                    event={event} 
                    onEditClick={handleManageClick}
                    onDeleteClick={handleDeleteClick}
                />
                ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-white">No events planned</h3>
                <p className="mt-1 text-sm text-slate-400">Get started by generating some ideas above!</p>
            </div>
          )}
        </div>
      </main>

      {managedEvent && (
        <RegistrationModal
          isOpen={isManageModalOpen}
          onClose={handleCloseModal}
          event={managedEvent}
          onSave={handleSaveEvent}
          onRegister={handleRegister}
          currentUser={currentUser}
        />
      )}

      <MyEventsModal 
        isOpen={isMyEventsModalOpen} 
        onClose={() => setMyEventsModalOpen(false)} 
        events={events} 
      />

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setSignInModalOpen(false)}
        onSignIn={handleSignIn}
      />
      
      {currentUser && (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setEditProfileModalOpen(false)}
          user={currentUser}
          onSave={handleUpdateUser}
        />
      )}

      <Chatbot availableEvents={events} />
    </div>
  );
}
