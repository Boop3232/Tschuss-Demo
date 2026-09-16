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
import { useLanguage } from '../../context/LanguageContext';

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

interface CategoryOption {
  id: string;
  enLabel: string;
  deLabel: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'All', enLabel: 'All Categories', deLabel: 'Alle Kategorien', icon: LayoutGrid },
  { id: 'Grocery', enLabel: 'Grocery', deLabel: 'Lebensmittel', icon: Apple },
  { id: 'Bakery', enLabel: 'Bakery', deLabel: 'Bäckerei', icon: Croissant },
  { id: 'Drinks', enLabel: 'Drinks', deLabel: 'Getränke', icon: Wine },
  { id: 'Cosmetics', enLabel: 'Cosmetics', deLabel: 'Kosmetik', icon: Sparkles },
  { id: 'Flowers', enLabel: 'Flowers', deLabel: 'Blumen', icon: Flower2 },
  { id: 'Household', enLabel: 'Household', deLabel: 'Haushalt', icon: Home }
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  const { language } = useLanguage();

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const label = language === 'de' ? cat.deLabel : cat.enLabel;

          return (
            <button
              key={cat.id}
              id={`cat-btn-${cat.id.toLowerCase()}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs font-bold'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-300' : 'text-stone-500'}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
