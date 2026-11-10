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

// Cache access token in memory
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Checks if the current page is running inside an iframe (e.g., AI Studio web preview)
 */
export const isRunningInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

/**
 * Initialize auth listener and catch redirect results if any.
 */
export const initAuth = (
  onAuthSuccess: (user: User, token?: string) => void,
  onAuthFailure: () => void
) => {
  // Check for redirect result on load (runs when returning from redirect auth)
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          cachedAccessToken = credential.accessToken;
        }
        const appUser: User = {
          uid: result.user.uid,
          name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
          email: result.user.email || '',
          role: 'Event Director'
        };
        onAuthSuccess(appUser, cachedAccessToken || undefined);
      }
    })
    .catch((err) => {
      console.warn("Redirect auth check notice:", err);
    });

  // Listen to standard Firebase auth state changes
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const appUser: User = {
        uid: firebaseUser.uid,
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
 * Translate Firebase Auth errors to clear, actionable guidance
 */
export const formatAuthErrorMessage = (err: any): string => {
  if (!err) return 'An unknown error occurred during sign in.';
  const code = err.code || '';
  
  if (code === 'auth/popup-closed-by-user') {
    return 'Sign in was cancelled (popup window was closed).';
  }
  if (code === 'auth/popup-blocked') {
    return 'The sign-in popup was blocked by your browser. Please allow popups or use the direct sign in option below.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This preview domain is pending authorization in Firebase Console. You can sign in using your profile below or open in a standalone tab.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network connection issue. Please verify internet access and try again.';
  }
  return err.message || 'Unable to complete sign-in. Please try again.';
};

/**
 * Sign in using Google via popup.
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
      uid: result.user.uid,
      name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
      email: result.user.email || '',
      role: 'Event Director'
    };

    return { user: appUser, accessToken: cachedAccessToken || undefined };
  } finally {
    isSigningIn = false;
  }
};

/**
 * Web redirect to Google sign-in.
 * If in an iframe, navigates the top window or launches the standalone window
 * because Google blocks loading inside iframes (X-Frame-Options: DENY).
 */
export const redirectToGoogleSignIn = async () => {
  isSigningIn = true;
  try {
    if (isRunningInIframe()) {
      // In an iframe, accounts.google.com sends X-Frame-Options: DENY.
      // Launching at top level or in standalone window ensures Google's web sign-in renders.
      window.open(window.location.href, '_blank');
      return;
    }
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Redirect sign-in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const signOutUser = async () => {
  await firebaseSignOut(auth);
  cachedAccessToken = null;
};
