import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastNotification } from '../types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg shadow-xl bg-white border border-[#E2E8F0] text-xs text-[#0F172A] animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center gap-2">
            {toast.type === 'warning' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-3.5 h-3.5 text-[#047857] shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
            )}
            <span className="font-medium text-[#0F172A] text-xs">{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-[#64748B] hover:text-[#0F172A] p-0.5 rounded transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
