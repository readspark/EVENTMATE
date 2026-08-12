
import React, { useState, useEffect } from 'react';
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
  const [error, setError] = useState('');

  // When the modal is opened with a new user, reset the form fields
  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setEmail(user.email);
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
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    onSave({ name, email });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-2xl max-w-sm w-full p-8 relative transform transition-all duration-300 ease-in-out scale-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-2 text-white text-center">Edit Profile</h2>
        <p className="text-slate-400 mb-6 text-center text-sm">Update your name and email address.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-300">Full Name</label>
            <input 
              type="text" 
              id="edit-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-slate-500 focus:border-slate-500" 
              required 
            />
          </div>
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-slate-300">Email Address</label>
            <input 
              type="email" 
              id="edit-email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-slate-500 focus:border-slate-500" 
              required 
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 mt-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};
