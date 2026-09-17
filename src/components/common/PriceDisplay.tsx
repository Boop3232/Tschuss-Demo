import React from 'react';
import { formatCurrency } from '../../utils/businessLogic';

interface PriceDisplayProps {
  originalPrice: number;
  rescuePrice: number;
  size?: 'sm' | 'md' | 'lg';
  showSavings?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  originalPrice,
  rescuePrice,
  size = 'md',
  showSavings = false
}) => {
  const savings = Math.max(0, originalPrice - rescuePrice);

  const sizes = {
    sm: {
      rescue: 'text-base font-black text-emerald-700',
      orig: 'text-xs text-stone-400 line-through'
    },
    md: {
      rescue: 'text-xl font-black text-emerald-700',
      orig: 'text-sm text-stone-400 line-through'
    },
    lg: {
      rescue: 'text-3xl font-black text-emerald-700 tracking-tight',
      orig: 'text-base text-stone-400 line-through'
    }
  }[size];

  return (
    <div className="flex flex-col items-start leading-tight">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={sizes.rescue}>{formatCurrency(rescuePrice)}</span>
        {originalPrice > rescuePrice && (
          <span className={sizes.orig}>{formatCurrency(originalPrice)}</span>
        )}
      </div>
      {showSavings && savings > 0 && (
        <span className="text-xs text-emerald-700 font-semibold mt-0.5">
          Save {formatCurrency(savings)}
        </span>
      )}
    </div>
  );
};
