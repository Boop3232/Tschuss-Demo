import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div 
        id="confirm-dialog-modal"
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">{title}</h3>
        </div>

        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-xs transition-colors ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-800 hover:bg-emerald-900'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
