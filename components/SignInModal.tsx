import React, { useState } from 'react';
import { X, User as UserIcon, Loader2, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import type { User } from '../types';
import { 
  signInWithGoogle, 
  redirectToGoogleSignIn, 
  formatAuthErrorMessage,
  isRunningInIframe 
} from '../services/authService';

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
      onSignIn({ ...user, email: user.email.trim().toLowerCase() });
      onClose();
    } catch (err: any) {
      console.error("Google sign in failure:", err);
      const msg = formatAuthErrorMessage(err);
      setError(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleRedirect = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await redirectToGoogleSignIn();
      if (isRunningInIframe()) {
        setError('Opened app in a standalone tab where Google web sign-in runs without iframe restrictions.');
      }
    } catch (err: any) {
      console.error("Redirect failure:", err);
      setError(formatAuthErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickSignIn = (userEmail: string) => {
    const extractedName = userEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
    onSignIn({
      name: formattedName || 'Event Director',
      email: userEmail.trim().toLowerCase(),
      role: 'Event Director'
    });
    onClose();
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
    const cleanEmail = email.trim().toLowerCase();
    onSignIn({ name: name.trim(), email: cleanEmail, role });
    onClose();
  };

  const inIframe = isRunningInIframe();

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-w-sm w-full p-6 relative">
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#047857]" />
            <h2 className="text-base font-bold text-[#0F172A] tracking-tight">Sign In</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-full hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
          Sign in to save your planned events, customize organizer email signatures, and manage attendees.
        </p>

        {/* Google Sign-In Buttons */}
        <div className="space-y-2 mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs rounded-full shadow-xs transition-colors disabled:opacity-50"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            <span>Sign in with Google Account</span>
          </button>

          <button
            type="button"
            onClick={handleGoogleRedirect}
            disabled={isGoogleLoading}
            className="w-full text-center text-[13px] text-[#64748B] hover:text-[#047857] py-1.5 px-3 rounded-full transition-colors flex items-center justify-center gap-1.5"
            title="Redirect to web for sign in"
          >
            <span>Redirect to web for sign in</span>
            {inIframe ? <ExternalLink className="w-3 h-3 text-[#64748B]" /> : <ArrowRight className="w-3 h-3 text-[#64748B]" />}
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-3 leading-relaxed">
            {error}
          </div>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="w-full border-t border-[#E2E8F0]" />
          <span className="bg-white px-2 text-[13px] text-[#64748B] uppercase tracking-wider absolute">
            or enter profile manually
          </span>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#047857]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#047857]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Role / Title
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Event Director"
              className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#047857]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-full bg-[#047857] hover:bg-[#065f46] text-white text-xs font-semibold shadow-xs transition-colors mt-2"
          >
            Save Profile & Continue
          </button>
        </form>
      </div>
    </div>
  );
};
