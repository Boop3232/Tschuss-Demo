import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-emerald-900/95 text-white border-emerald-700'
                : isError
                ? 'bg-rose-900/95 text-white border-rose-700'
                : 'bg-stone-900/95 text-white border-stone-700'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm">
              {toast.title && <p className="font-bold mb-0.5">{toast.title}</p>}
              <p className="text-xs text-stone-200 leading-snug">{toast.message}</p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-stone-400 hover:text-white transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
