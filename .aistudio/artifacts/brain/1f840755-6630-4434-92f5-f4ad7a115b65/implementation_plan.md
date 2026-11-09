# Implementation Plan: Cloud Migration & User-Account Linking

This plan outlines the steps to migrate data from browser-based `localStorage` to Firebase Firestore, ensuring all event data, attendee lists, and user preferences are persistently linked to the authenticated user account.

## Phase 1: Firebase Infrastructure
- **Provisioning**: Use `set_up_firebase` to enable Firestore and Auth.
- **Rules Design**: Configure `firestore.rules` to ensure users can only read/write their own events and attendee data (using `request.auth.uid`).

## Phase 2: Data Architecture
- **Schema Migration**:
    - `users/{uid}`: Stores user profile (name, role, email) and preferences (viewMode).
    - `events/{eventId}`: Each event document will include an `ownerId: string` field.
    - `attendees/{attendeeId}`: Nested subcollection within events or a top-level collection linked by `eventId` (enforcing access control).

## Phase 3: Migration & Synchronization
- **Migration Logic**: Implement an `onAuthStateChanged` hook that checks for local data upon first login. If found, it will trigger a one-time upload to Firestore and clear `localStorage`.
- **Data Hook Refactor**: Replace all `localStorage` state initialization with asynchronous Firestore data fetching. 
- **Real-time Sync**: Use `onSnapshot` for events, ensuring the dashboard dynamically updates as data changes in the cloud.

## Phase 4: UI Adjustments
- Update Sign-In logic to trigger the migration immediately upon successful authentication.
- Ensure the app explicitly displays an "Empty Dashboard" state for unauthenticated users or users with no cloud data.
