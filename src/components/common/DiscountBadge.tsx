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
  // Sustainable, minimalist badges:
  // High discount (>= 50%): deep charcoal/forest badge with high contrast white text
  // Moderate discount (< 50%): warm stone badge with dark charcoal text
  const isHighDiscount = percent >= 50;
  const colorStyles = isHighDiscount
    ? 'bg-emerald-600 text-white font-black shadow-xs'
    : 'bg-amber-400 text-stone-950 font-black shadow-xs';

  const sizeStyles = {
    sm: 'text-2xs px-2 py-0.5 rounded-lg tracking-tight',
    md: 'text-xs px-2.5 py-1 rounded-xl tracking-tight',
    lg: 'text-sm px-3 py-1.5 rounded-2xl tracking-tight'
  }[size];

  return (
    <span 
      className={`inline-flex items-center justify-center uppercase whitespace-nowrap transition-all ${colorStyles} ${sizeStyles} ${className}`}
    >
      -{Math.round(percent)}%
    </span>
  );
};

