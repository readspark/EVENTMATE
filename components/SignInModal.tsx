import React, { useState } from 'react';
import { X, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';
import type { User } from '../types';
import { signInWithGoogle, redirectToGoogleSignIn } from '../services/authService';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (user: User) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSignIn }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Event Director');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const { user } = await signInWithGoogle();
      onSignIn(user);
      onClose();
    } catch (err: any) {
      console.error("Google sign in failure:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled.');
      } else {
        setError(err.message || 'Unable to sign in with Google. You can also try redirecting to the web sign-in page below.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleRedirect = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await redirectToGoogleSignIn();
    } catch (err: any) {
      console.error("Redirect failure:", err);
      setError(err.message || 'Failed to redirect to Google.');
      setIsGoogleLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    onSignIn({ name: name.trim(), email: email.trim(), role });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Sign In</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Sign in to save your event portfolio, customize organizer email signatures, and manage attendees.
        </p>

        {/* Google Sign-In Primary Button */}
        <div className="space-y-2 mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded-lg shadow transition-colors disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>

          <button
            type="button"
            onClick={handleGoogleRedirect}
            disabled={isGoogleLoading}
            className="w-full text-center text-[11px] text-slate-400 hover:text-indigo-400 py-1 transition-colors flex items-center justify-center gap-1"
          >
            <span>Redirect to Google web sign in</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="w-full border-t border-slate-800" />
          <span className="bg-slate-900 px-2 text-[11px] text-slate-500 uppercase tracking-wider absolute">
            or continue manually
          </span>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Role / Title
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Event Director"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-rose-400 text-xs">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors mt-2"
          >
            Save Planner Profile
          </button>
        </form>
      </div>
    </div>
  );
};
