import React, { useState, useEffect } from 'react';
import { X, Mail, Copy, Check, ExternalLink } from 'lucide-react';
import type { Event } from '../types';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  initialContent: {
    subject: string;
    body: string;
  };
  onToast?: (message: string) => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  event,
  initialContent,
  onToast,
}) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialContent) {
      setSubject(initialContent.subject);
      setBody(initialContent.body);
    }
  }, [initialContent, isOpen]);

  if (!isOpen) return null;

  const handleSendMailto = () => {
    if (!event.registrations || event.registrations.length === 0) {
      alert('No registered attendees to send reminders to.');
      return;
    }

    const recipientEmails = event.registrations.map(r => r.email).join(',');
    const mailtoLink = `mailto:?bcc=${encodeURIComponent(recipientEmails)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    if (onToast) onToast(`Opened mail client for ${event.registrations.length} attendees`);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onToast) onToast('Reminder email copied to clipboard');
  };

  const recipientCount = event.registrations?.length || 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-xl w-full p-6 relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Attendee Reminder Broadcast</h2>
              <p className="text-xs text-slate-400">Dispatch to {recipientCount} registered attendee{recipientCount === 1 ? '' : 's'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 flex-grow overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Email Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={9}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs leading-relaxed font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Body</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendMailto}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch Mail Client ({recipientCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};