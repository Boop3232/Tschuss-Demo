import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  max: number;
  min?: number;
  onChange: (qty: number) => void;
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  max,
  min = 1,
  onChange,
  disabled = false
}) => {
  const handleDecrement = () => {
    if (quantity > min && !disabled) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < max && !disabled) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="inline-flex items-center border border-stone-300 rounded-xl bg-white p-1 shadow-2xs">
      <button
        type="button"
        id="btn-qty-decrement"
        onClick={handleDecrement}
        disabled={quantity <= min || disabled}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-stone-600 hover:text-emerald-900 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>

      <span className="w-10 text-center font-bold text-stone-900 text-base select-none">
        {quantity}
      </span>

      <button
        type="button"
        id="btn-qty-increment"
        onClick={handleIncrement}
        disabled={quantity >= max || disabled}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-stone-600 hover:text-emerald-900 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
