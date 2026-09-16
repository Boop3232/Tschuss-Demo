import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  id = 'empty-state-container'
}) => {
  return (
    <div id={id} className="flex flex-col items-center justify-center p-8 text-center bg-white/70 border border-stone-200/80 rounded-2xl max-w-md mx-auto my-8 shadow-2xs">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-stone-900 mb-1">{title}</h3>
      <p className="text-sm text-stone-700 max-w-xs mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
