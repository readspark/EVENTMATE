import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, writeBatch, serverTimestamp, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Event, Registration, User } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Collection References
export const usersRef = collection(db, 'users');
export const eventsRef = collection(db, 'events');

/**
 * Migration: Sync local storage to Firestore
 */
export const migrateLocalToCloud = async (uid: string, localEvents: Event[]) => {
  const batch = writeBatch(db);
  
  for (const event of localEvents) {
    const eventRef = doc(eventsRef);
    batch.set(eventRef, {
      ...event,
      ownerId: uid,
      createdAt: serverTimestamp()
    });
  }
  
  await batch.commit();
  localStorage.removeItem('eventmate-events-v3');
};

/**
 * Fetch events for authenticated user
 */
export const subscribeToUserEvents = (uid: string, callback: (events: Event[]) => void) => {
  const q = query(eventsRef, where('ownerId', '==', uid));
  return onSnapshot(q, (snapshot) => {
    const events: Event[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Event));
    callback(events);
  });
};

export const saveEventToCloud = async (uid: string, event: Event) => {
  if (event.id && typeof event.id === 'string') {
    // Update existing
    await updateDoc(doc(eventsRef, event.id), { ...event });
  } else {
    // Add new
    await addDoc(eventsRef, { ...event, ownerId: uid });
  }
};

export const deleteEventFromCloud = async (eventId: string) => {
  await deleteDoc(doc(eventsRef, eventId));
};

export const saveUserProfile = async (uid: string, user: User) => {
  await setDoc(doc(usersRef, uid), user, { merge: true });
};
