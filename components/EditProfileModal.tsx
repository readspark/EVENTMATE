import React, { useState, useEffect } from 'react';
import { X, User as UserIcon } from 'lucide-react';
import type { User } from '../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (user: User) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role || 'Event Director');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role || 'Event Director');
      setError('');
    }
  }, [isOpen, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) {
      setError('Both name and email are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    onSave({ name: name.trim(), email: email.trim(), role });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-[#10B981]/30 flex items-center justify-center text-[#047857]">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-[#0F172A] tracking-tight">Edit Planner Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-full hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="edit-name" className="block text-xs font-semibold text-[#64748B] mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#047857] focus:ring-1 focus:ring-[#047857] transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-email" className="block text-xs font-semibold text-[#64748B] mb-1">
              Work Email
            </label>
            <input
              type="email"
              id="edit-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#047857] focus:ring-1 focus:ring-[#047857] transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-role" className="block text-xs font-semibold text-[#64748B] mb-1">
              Role / Title
            </label>
            <input
              type="text"
              id="edit-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#047857] focus:ring-1 focus:ring-[#047857] transition-colors"
            />
          </div>

          {error && <p className="text-rose-600 text-xs">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-full bg-[#047857] hover:bg-[#065f46] text-white text-xs font-semibold transition-colors mt-2 shadow-xs"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};
