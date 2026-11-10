import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  onSnapshot, 
  writeBatch, 
  setDoc, 
  deleteDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import type { Event, User } from '../types';

// Initialize Firebase App & Firestore
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Collection References
export const eventsRef = collection(db, 'events');
export const usersRef = collection(db, 'users');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validates connection to Firestore on app startup
 */
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline. Verify network connection.");
    }
  }
}

/**
 * Subscribes to real-time events for the signed-in user across all devices.
 * Queries by creatorEmail so that signing in on another device with the same email
 * instantly retrieves and live-syncs all user events.
 */
export const subscribeToUserEvents = (
  user: User,
  onEventsUpdate: (events: Event[]) => void,
  onError?: (err: any) => void
) => {
  const uid = user.uid || auth.currentUser?.uid;
  const email = (user.email || auth.currentUser?.email || '').toLowerCase().trim();

  if (!email && !uid) {
    onEventsUpdate([]);
    return () => {};
  }

  // Query events matching this user's email across all devices
  const q = email
    ? query(eventsRef, where('creatorEmail', '==', email))
    : query(eventsRef, where('ownerId', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const cloudEvents: Event[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || 'Untitled Event',
          description: data.description || '',
          date: data.date || '',
          time: data.time || '10:00 AM - 04:00 PM',
          location: data.location || 'Main Venue',
          isVirtual: data.isVirtual ?? false,
          category: data.category || 'Conference',
          status: data.status || 'Upcoming',
          capacity: data.capacity || 100,
          registrations: Array.isArray(data.registrations) ? data.registrations : [],
          agenda: Array.isArray(data.agenda) ? data.agenda : [],
          ownerId: data.ownerId || uid,
          creatorEmail: data.creatorEmail || email,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as Event;
      });

      onEventsUpdate(cloudEvents);
    },
    (error) => {
      console.warn("Firestore onSnapshot subscription notice:", error);
      if (onError) onError(error);
    }
  );
};

/**
 * Saves or updates an event in Firestore with the user's ownerId and email
 */
export const saveEventToCloud = async (user: User, event: Event): Promise<void> => {
  const eventId = String(event.id);
  const uid = user.uid || auth.currentUser?.uid || '';
  const email = (user.email || auth.currentUser?.email || '').toLowerCase().trim();

  try {
    const docRef = doc(db, 'events', eventId);
    const payload = {
      ...event,
      id: eventId,
      ownerId: uid,
      creatorEmail: email,
      time: event.time || '10:00 AM - 04:00 PM',
      updatedAt: new Date().toISOString(),
      createdAt: event.createdAt || new Date().toISOString()
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.error("saveEventToCloud notice:", err);
  }
};

/**
 * Deletes an event document from Firestore
 */
export const deleteEventFromCloud = async (eventId: string | number): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'events', String(eventId)));
  } catch (err) {
    console.error("deleteEventFromCloud notice:", err);
  }
};

/**
 * Migrates local storage events to the user's cloud Firestore collection upon sign in
 */
export const migrateLocalToCloud = async (user: User, localEvents: Event[]): Promise<void> => {
  if (!localEvents || localEvents.length === 0) return;
  const uid = user.uid || auth.currentUser?.uid || '';
  const email = (user.email || auth.currentUser?.email || '').toLowerCase().trim();
  if (!email && !uid) return;

  try {
    const batch = writeBatch(db);
    for (const ev of localEvents) {
      const eventId = String(ev.id);
      const eventRef = doc(db, 'events', eventId);
      batch.set(eventRef, {
        ...ev,
        id: eventId,
        ownerId: uid,
        creatorEmail: email,
        time: ev.time || '10:00 AM - 04:00 PM',
        updatedAt: new Date().toISOString(),
        createdAt: ev.createdAt || new Date().toISOString()
      }, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.warn("Local events migration notice:", err);
  }
};

/**
 * Saves user profile to Firestore
 */
export const saveUserProfile = async (user: User): Promise<void> => {
  const uid = user.uid || auth.currentUser?.uid;
  if (!uid) return;
  const path = `users/${uid}`;
  try {
    await setDoc(doc(usersRef, uid), user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};
