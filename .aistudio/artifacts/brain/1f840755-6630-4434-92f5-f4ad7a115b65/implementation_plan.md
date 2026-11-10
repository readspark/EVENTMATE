# Multi-Device Cloud Synchronization for EventMate

A real-time, multi-device cloud synchronization architecture for EventMate using Firebase Firestore and Firebase Authentication. When a user signs in, creates events, and later signs in on another device with the same email, all their events, attendee lists, check-in records, and run-of-show schedules seamlessly sync across devices in real time.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified and confirmed during interactive requirements gathering:

- **Confirmed: Local Event Migration**: When a user with pre-existing local events on a device signs in, those events will automatically migrate to their cloud account without losing any data.
- **Confirmed: Real-Time Live Sync**: State synchronization across active devices is powered by Firestore real-time listeners (`onSnapshot`), propagating event creations, edits, check-in updates, and deletions immediately across open tabs or devices.
- **Confirmed: Access & Privacy Boundary**: Events are tied to the creator's authenticated identity (`ownerId` / `creatorEmail`). Only the authenticated event organizer can view and manage their events across devices.

---

## 1. Overview & Core Concept

- **What It Delivers**: Transforms EventMate from a single-browser `localStorage` sandbox into a cloud-synchronized event operations hub. Any event created or edited on one computer or phone is immediately reflected on any other device where the organizer signs in with the same account.
- **Target Audience**: Event directors, conference organizers, workshop leaders, and team coordinators managing events across multiple laptops, tablets, or check-in desks.
- **Key Value**: Organizers no longer risk data loss when clearing browser cache or changing laptops; multiple devices at an event (e.g. check-in iPad and stage manager laptop) stay unified live.

---

## 2. User Experience & Visual Design

- **Sign In & Sync Flow**:
  1. **Device A**: The user signs in via Google or profile login. If local events exist, they are seamlessly saved to the user's Firestore cloud collection.
  2. **Device B**: The user signs in using the same email. EventMate instantly subscribes to their Firestore collection, populating the dashboard with all their events, attendee counts, and schedules.
  3. **Live Syncing**: When an attendee checks in on Device B or a new agenda item is added, Device A updates immediately without needing a manual page refresh.
  4. **Sign Out Behavior**: Signing out transitions back to a clean guest view while preserving all events safely in the cloud.
- **Visual Identity & Theme**:
  - Retains the exact approved color palette:
    - **Primary (`#047857`)**: Primary buttons, active tabs, focus states.
    - **Secondary (`#10B981`)**: Real-time sync status badges, check-in indicators, success notifications.
    - **Accent (`#FBBF24`)**: AI sparkles and highlights.
    - **Canvas (`#F1F5F9`)**: Light slate background.
    - **Surface (`#FFFFFF`)**: Crisp white card surfaces with `#E2E8F0` dividing borders.
    - **Text (`#0F172A`)** and **Secondary Text (`#64748B`)**: High contrast typography adhering to the +2px font size scale.
- **Interactive Feedback**:
  - Non-intrusive cloud sync badge in the header/profile dropdown ("Synced with Cloud").
  - Smooth loading skeletons when switching accounts or initializing first cloud sync.
  - Optimistic local state updates paired with resilient background cloud sync.

---

## 3. Key Product Decisions & Trade-Offs

- **Firestore Real-Time Listeners vs. Polling/Refresh**:
  - *Chosen*: `onSnapshot` real-time listeners.
  - *Why*: Provides instant updates across multiple devices (e.g. attendee checked in at entrance reflects on stage manager dashboard immediately) with minimal network overhead.
- **Document Model: Root Collection with Owner ID Query vs. Nested Subcollections**:
  - *Chosen*: Root `/events/{eventId}` collection indexed with `ownerId == auth.uid`.
  - *Why*: Enables flexible compound queries (such as ordering by date or filtering by status), simplified batch writes, and clean Firestore security rules while enforcing strict owner isolation.
- **Offline / Local Fallback**:
  - *Chosen*: Hybrid sync — when unauthenticated, events remain in local storage; upon authentication, local events are imported to cloud, and live Firestore state authoritative cache takes over.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Multi-Device Cloud Architecture               │
└────────────────────────────────────────────────────────────────────────┘

    [Device A: Desktop Browser]             [Device B: Tablet / Mobile]
                 │                                       │
                 ▼                                       ▼
        Firebase Auth Token                     Firebase Auth Token
        (uid: "usr_abc123")                     (uid: "usr_abc123")
                 │                                       │
                 ├───────────────────┬───────────────────┤
                 │                   │                   │
                 ▼                   ▼                   ▼
    ┌────────────────────────────────────────────────────────────┐
    │          Firestore Database (Database ID: configured)      │
    │                                                            │
    │   Collection: /events/{eventId}                            │
    │   ├── id: "evt_123"                                        │
    │   ├── ownerId: "usr_abc123"                                │
    │   ├── creatorEmail: "organizer@domain.com"                  │
    │   ├── title, date, time, location, description, category   │
    │   ├── registrations: [ { id, name, email, checkedIn } ]    │
    │   ├── timeline: [ { id, time, activity, speaker } ]        │
    │   └── updatedAt: timestamp                                 │
    └────────────────────────────────────────────────────────────┘
                 │                                       │
                 │ ◄────── onSnapshot live stream ──────►│
```

### Data Schema (`firebase-blueprint.json`)
- Define the `Event` entity with required fields (`id`, `title`, `date`, `time`, `location`, `ownerId`, `creatorEmail`, `registrations`, `timeline`).
- Set up path definition for `/events/{eventId}` referencing the `Event` entity.

### Security Rules (`firestore.rules`)
- Enforce strict Attribute-Based Access Control (ABAC):
  - `allow list, get`: only if `isSignedIn() && resource.data.ownerId == request.auth.uid`.
  - `allow create`: only if `isSignedIn() && request.resource.data.ownerId == request.auth.uid`.
  - `allow update`: only if `isSignedIn() && resource.data.ownerId == request.auth.uid && request.resource.data.ownerId == request.auth.uid`.
  - `allow delete`: only if `isSignedIn() && resource.data.ownerId == request.auth.uid`.

### Service Layer (`services/eventService.ts`)
- `subscribeToUserEvents(userId, onUpdate, onError)`: Attaches `onSnapshot` query `collection(db, 'events')` filtered by `where('ownerId', '==', userId)`.
- `createEventInCloud(event, user)`: Writes document to `/events/{eventId}` with `ownerId` and `creatorEmail`.
- `updateEventInCloud(eventId, partial)`: Updates existing event.
- `deleteEventFromCloud(eventId)`: Removes event document.
- `syncLocalEventsToCloud(localEvents, user)`: Scans un-synced events and upserts them to Firestore.
- `handleFirestoreError`: Implements standard diagnostic error handling.

---

## 5. Verification & Testing Plan

1. **Rule & Schema Validation**:
   - Validate `firebase-blueprint.json` schema and generate `firestore.rules`.
   - Run linter and deploy rules using the `DeployRules` RPC.
2. **Local to Cloud Migration**:
   - Verify that events created in guest mode are uploaded when the user signs in.
3. **Cross-Device Simulation**:
   - Sign in as the user in one session and add an event; verify data persists in Firestore.
   - Simulate opening the app in a private/incognito session and signing in with the same email; verify all events and registrations load in real time.
   - Trigger attendee check-in and verify instant bi-directional updates.
4. **Compilation & Lint**:
   - Run `compile_applet` and `lint_applet` together to verify 0 errors.
