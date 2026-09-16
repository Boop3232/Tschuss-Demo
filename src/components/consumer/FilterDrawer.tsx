import React from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { FilterOptions, ProductCategory } from '../../types';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onChangeFilters: (newFilters: FilterOptions) => void;
  onReset: () => void;
  totalResultsCount?: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onChangeFilters,
  onReset,
  totalResultsCount
}) => {
  if (!isOpen) return null;

  const handleDistanceChange = (km: number) => {
    onChangeFilters({ ...filters, maxDistanceKm: km });
  };

  const handleDiscountChange = (pct: number) => {
    onChangeFilters({ ...filters, minDiscountPercent: pct });
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    onChangeFilters({ ...filters, sortBy });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        id="filter-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-lg text-stone-900">Filters & Sorting</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Body */}
        <div className="p-5 space-y-6 flex-1">
          {/* Sort Options */}
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'distance', label: 'Best Deals / Proximity' },
                { id: 'discount', label: 'Highest Discount' },
                { id: 'cheapest', label: 'Lowest Price' },
                { id: 'expiry', label: 'Expiring Soonest' }
              ].map((sort) => (
                <button
                  key={sort.id}
                  type="button"
                  onClick={() => handleSortChange(sort.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                    (filters.sortBy || 'distance') === sort.id
                      ? 'bg-emerald-900 text-white border-emerald-900 shadow-xs'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Radius */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Max Distance (Radius)
              </label>
              <span className="text-xs font-bold text-emerald-800">
                {filters.maxDistanceKm ? `${filters.maxDistanceKm} km` : 'Any'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[2, 5, 10, 20].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => handleDistanceChange(filters.maxDistanceKm === km ? 0 : km)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    filters.maxDistanceKm === km
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Discount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Minimum Discount
              </label>
              <span className="text-xs font-bold text-emerald-800">
                {filters.minDiscountPercent ? `≥ ${filters.minDiscountPercent}% OFF` : 'Any'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[30, 50, 70].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleDiscountChange(filters.minDiscountPercent === pct ? 0 : pct)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    filters.minDiscountPercent === pct
                      ? 'bg-emerald-800 text-white border-emerald-800'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  ≥ {pct}% OFF
                </button>
              ))}
            </div>
          </div>

          {/* Max Price */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Maximum Price (€)
              </label>
              <span className="text-xs font-bold text-emerald-800">
                {filters.maxPrice ? `Up to €${filters.maxPrice}` : 'No limit'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={filters.maxPrice || 15}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeFilters({ ...filters, maxPrice: val >= 15 ? undefined : val });
              }}
              className="w-full accent-emerald-800 cursor-pointer"
            />
            <div className="flex justify-between text-2xs text-stone-400 mt-1">
              <span>€1.00</span>
              <span>€7.50</span>
              <span>€15.00+</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-stone-100 bg-stone-50/70 flex items-center gap-3">
          <button
            type="button"
            id="btn-reset-filters"
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="button"
            id="btn-apply-filters"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            Show {totalResultsCount !== undefined ? `${totalResultsCount} Deals` : 'Results'}
          </button>
        </div>
      </div>
    </div>
  );
};
