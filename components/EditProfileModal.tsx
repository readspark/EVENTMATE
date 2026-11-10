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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-end justify-end p-4 sm:p-6 z-50 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#020204] border border-[#1F1F24] rounded-2xl shadow-2xl shadow-black/80 max-w-xs w-full p-5 relative mb-[85px] animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#1F1F24] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#060608] border border-[#1F1F24] flex items-center justify-center text-[#A78BFA]">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Edit Planner Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E8E93] hover:text-white p-1 rounded-full hover:bg-[#141418] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="edit-name" className="block text-[11px] font-medium text-[#8E8E93] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#060608] border border-[#1F1F24] hover:border-[#33333D] rounded-lg text-white text-xs placeholder-[#52525B] focus:outline-none focus:border-[#7C3AED] transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-email" className="block text-[11px] font-medium text-[#8E8E93] mb-1.5">
              Work Email
            </label>
            <input
              type="email"
              id="edit-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#060608] border border-[#1F1F24] hover:border-[#33333D] rounded-lg text-white text-xs placeholder-[#52525B] focus:outline-none focus:border-[#7C3AED] transition-colors"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-role" className="block text-[11px] font-medium text-[#8E8E93] mb-1.5">
              Role / Title
            </label>
            <input
              type="text"
              id="edit-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-[#060608] border border-[#1F1F24] hover:border-[#33333D] rounded-lg text-white text-xs placeholder-[#52525B] focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          {error && <p className="text-[#EF4444] text-xs">{error}</p>}

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium transition-colors mt-2 shadow-sm"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};
