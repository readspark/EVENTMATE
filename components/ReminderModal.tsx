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
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xl max-w-xl w-full p-6 relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-[#10B981]/30 flex items-center justify-center text-[#047857]">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#0F172A] tracking-tight">Attendee Reminder</h2>
              <p className="text-xs text-[#64748B]">Dispatch to {recipientCount} registered attendee{recipientCount === 1 ? '' : 's'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0F172A] p-1 rounded-full hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 flex-grow overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-xs placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#047857] focus:ring-1 focus:ring-[#047857] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
              Email Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={9}
              className="w-full px-3 py-2.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg text-[#0F172A] text-xs leading-relaxed font-sans placeholder-[#64748B] focus:outline-none focus:bg-white focus:border-[#047857] focus:ring-1 focus:ring-[#047857] transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] px-3.5 py-1.5 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] transition-colors font-medium"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981] font-semibold">Copied</span>
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
              className="px-3.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] rounded-full hover:bg-[#F1F5F9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendMailto}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-[#047857] hover:bg-[#065f46] text-white transition-colors shadow-xs"
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