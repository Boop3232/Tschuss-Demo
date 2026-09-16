import React from 'react';
import { 
  ShoppingBag, 
  Apple, 
  Croissant, 
  Sparkles, 
  Flower2, 
  Wine, 
  Home,
  LayoutGrid
} from 'lucide-react';
import { ProductCategory } from '../../types';

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

interface CategoryOption {
  id: string;
  label: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'All', label: 'All', icon: LayoutGrid },
  { id: 'Grocery', label: 'Grocery', icon: Apple },
  { id: 'Bakery', label: 'Bakery', icon: Croissant },
  { id: 'Drinks', label: 'Drinks', icon: Wine },
  { id: 'Cosmetics', label: 'Cosmetics', icon: Sparkles },
  { id: 'Flowers', label: 'Flowers', icon: Flower2 },
  { id: 'Household', label: 'Household', icon: Home }
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              id={`cat-btn-${cat.id.toLowerCase()}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-300' : 'text-stone-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
