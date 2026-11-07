import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import type { User } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.setCustomParameters({
  prompt: 'select_account'
});

// Cache access token in memory (never in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Initialize auth listener and catch redirect results if any.
 */
export const initAuth = (
  onAuthSuccess: (user: User, token?: string) => void,
  onAuthFailure: () => void
) => {
  // Check for redirect result on load
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          cachedAccessToken = credential.accessToken;
        }
        const appUser: User = {
          name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          email: result.user.email || '',
          role: 'Event Director'
        };
        onAuthSuccess(appUser, cachedAccessToken || undefined);
      }
    })
    .catch((err) => {
      console.warn("Redirect auth check note:", err);
    });

  // Listen to standard Firebase auth state changes
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const appUser: User = {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        role: 'Event Director'
      };
      onAuthSuccess(appUser, cachedAccessToken || undefined);
    } else {
      cachedAccessToken = null;
      if (!isSigningIn) {
        onAuthFailure();
      }
    }
  });
};

/**
 * Sign in using Google. Tries popup first; if popups are blocked, falls back to redirect.
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken?: string }> => {
  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }

    const appUser: User = {
      name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
      email: result.user.email || '',
      role: 'Event Director'
    };

    return { user: appUser, accessToken: cachedAccessToken || undefined };
  } catch (error: any) {
    console.error("Popup sign-in error:", error);
    // If popup was blocked or closed, try redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, provider);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Direct redirect to Google web sign in.
 */
export const redirectToGoogleSignIn = async () => {
  isSigningIn = true;
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Redirect sign-in error:", error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const signOutUser = async () => {
  await firebaseSignOut(auth);
  cachedAccessToken = null;
};
