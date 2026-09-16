import React from 'react';

interface DiscountBadgeProps {
  percent: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({ 
  percent, 
  size = 'md',
  className = '' 
}) => {
  // Soft pastel colors matching minimalist aesthetic:
  // High: >= 60% soft pastel rose/coral
  // Medium: 40-59% soft pastel apricot/peach
  // Low: < 40% soft pastel mint/sage
  let colorStyles = 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold';
  if (percent >= 60) {
    colorStyles = 'bg-rose-50 text-rose-700 border border-rose-200/80 font-bold';
  } else if (percent >= 40) {
    colorStyles = 'bg-amber-50 text-amber-800 border border-amber-200/80 font-semibold';
  } else {
    colorStyles = 'bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold';
  }

  const sizeStyles = {
    sm: 'text-2xs px-2 py-0.5 rounded-lg tracking-tight',
    md: 'text-xs px-2.5 py-1 rounded-xl font-bold tracking-tight',
    lg: 'text-sm px-3 py-1.5 rounded-2xl font-bold tracking-tight'
  }[size];

  return (
    <span 
      className={`inline-flex items-center justify-center uppercase whitespace-nowrap shadow-2xs backdrop-blur-xs transition-transform ${colorStyles} ${sizeStyles} ${className}`}
    >
      -{Math.round(percent)}%
    </span>
  );
};
