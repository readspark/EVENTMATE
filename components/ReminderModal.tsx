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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
      <div className="bg-[#020204] border border-[#1F1F24] rounded-2xl shadow-2xl shadow-black/80 max-w-xl w-full p-6 relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-[#1F1F24] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#060608] border border-[#1F1F24] flex items-center justify-center text-[#A78BFA]">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Attendee Reminder</h2>
              <p className="text-xs text-[#8E8E93]">Dispatch to {recipientCount} registered attendee{recipientCount === 1 ? '' : 's'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8E8E93] hover:text-white p-1 rounded-full hover:bg-[#141418] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 flex-grow overflow-y-auto pr-1">
          <div>
            <label className="block text-[11px] font-medium text-[#8E8E93] mb-1.5">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-[#060608] border border-[#1F1F24] hover:border-[#33333D] rounded-lg text-white text-xs placeholder-[#52525B] focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#8E8E93] mb-1.5">
              Email Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={9}
              className="w-full px-3 py-2.5 bg-[#060608] border border-[#1F1F24] hover:border-[#33333D] rounded-lg text-white text-xs leading-relaxed font-sans placeholder-[#52525B] focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#1F1F24]">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-[#8E8E93] hover:text-white px-3.5 py-1.5 rounded-full bg-[#060608] hover:bg-[#141418] border border-[#1F1F24] hover:border-[#33333D] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981] font-medium">Copied</span>
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
              className="px-3.5 py-1.5 text-xs font-medium text-[#8E8E93] hover:text-white rounded-full hover:bg-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendMailto}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors shadow-sm"
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