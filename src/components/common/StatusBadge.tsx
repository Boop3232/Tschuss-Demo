import React from 'react';
import { ReservationStatus, ProductStatus } from '../../types';

interface StatusBadgeProps {
  status: ReservationStatus | ProductStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const norm = status.toUpperCase();

  let styles = 'bg-stone-100 text-stone-700 border-stone-200';

  switch (norm) {
    case 'ACTIVE':
    case 'CONFIRMED':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'READY':
      styles = 'bg-blue-50 text-blue-800 border-blue-200 font-semibold animate-pulse';
      break;
    case 'COLLECTED':
    case 'COMPLETED':
      styles = 'bg-teal-50 text-teal-800 border-teal-200';
      break;
    case 'PENDING':
    case 'DRAFT':
    case 'PAUSED':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'EXPIRED':
    case 'SOLD_OUT':
    case 'CANCELLED':
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      break;
  }

  const sizeClass = size === 'sm' 
    ? 'text-xs px-2.5 py-0.5 rounded-full' 
    : 'text-sm px-3 py-1 rounded-full';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border ${styles} ${sizeClass} tracking-wide whitespace-nowrap`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};
