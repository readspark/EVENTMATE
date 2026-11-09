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
          className="pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg shadow-xl bg-[#060608] border border-[#1F1F24] text-xs text-white animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center gap-2">
            {toast.type === 'warning' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
            )}
            <span className="font-normal text-white text-xs">{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-[#8E8E93] hover:text-white p-0.5 rounded transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};
