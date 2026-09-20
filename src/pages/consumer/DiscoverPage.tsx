import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Search, 
  SlidersHorizontal, 
  Map as MapIcon, 
  LayoutGrid, 
  Sparkles, 
  MapPin, 
  RefreshCw,
  Clock,
  TrendingDown
} from 'lucide-react';
import { Product, Store, FilterOptions } from '../../types';
import { productService } from '../../services/productService';
import { storeService } from '../../services/storeService';
import { useLocation } from '../../context/LocationContext';
import { ProductCard } from '../../components/consumer/ProductCard';
import { CategorySelector } from '../../components/consumer/CategorySelector';
import { FilterDrawer } from '../../components/consumer/FilterDrawer';
import { MapView } from '../../components/consumer/MapView';
import { ReservationModal } from '../../components/consumer/ReservationModal';
import { ProductGridSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { seedDemoDataIfEmpty } from '../../services/seedDataService';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location } = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Active reservation modal state
  const [reservingProduct, setReservingProduct] = useState<Product | null>(null);

  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    category: searchParams.get('category') || 'All',
    searchQuery: searchParams.get('q') || '',
    maxDistanceKm: 15,
    minDiscountPercent: 0,
    sortBy: 'distance'
  });

  // Seed demo data once on initial mount if database is unseeded
  useEffect(() => {
    seedDemoDataIfEmpty().catch(err => console.warn('Initial seed check:', err));
  }, []);

  // Load stores and products
  const loadData = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [loadedProducts, loadedStores] = await Promise.all([
        productService.getProducts(filters, location),
        storeService.getStores()
      ]);

      setProducts(loadedProducts);
      setStores(loadedStores);
    } catch (err) {
      console.error('Failed to load discovery data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [
    filters.category,
    filters.searchQuery,
    filters.maxDistanceKm,
    filters.minDiscountPercent,
    filters.maxPrice,
    filters.sortBy,
    location?.lat,
    location?.lng
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Silent debounced reload on external updates (e.g. retailer toggles active product)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleProductsChanged = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        loadData(true);
      }, 300);
    };
    window.addEventListener('tschuess_products_changed', handleProductsChanged);
    window.addEventListener('storage', handleProductsChanged);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('tschuess_products_changed', handleProductsChanged);
      window.removeEventListener('storage', handleProductsChanged);
    };
  }, [loadData]);

  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleQuickReserve = (product: Product) => {
    setReservingProduct(product);
  };

  const activeStoreForModal = reservingProduct
    ? stores.find(s => s.id === reservingProduct.storeId) || {
        id: reservingProduct.storeId,
        name: reservingProduct.storeName,
        ownerId: '',
        address: reservingProduct.storeAddress || 'Kleve City Center',
        city: reservingProduct.storeCity || 'Kleve',
        latitude: reservingProduct.storeLat || 51.7891,
        longitude: reservingProduct.storeLng || 6.1381,
        openingHours: 'Mon-Sat 08:00 - 21:00',
        phone: '+49 2821 97810',
        categories: ['Grocery'],
        status: 'active'
      }
    : null;

  // Active filter count
  const activeFilterCount = (
    (filters.category && filters.category !== 'All' ? 1 : 0) +
    (filters.minDiscountPercent && filters.minDiscountPercent > 0 ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.maxDistanceKm && filters.maxDistanceKm < 20 ? 1 : 0)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Location Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-stone-200/80 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-2xs font-semibold uppercase tracking-wider mb-2 border border-stone-200">
            <Sparkles className="w-3.5 h-3.5 text-stone-500" />
            Near-Expiry Rescue Marketplace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight leading-tight text-stone-900">
            Rescue Delicious Food in {location.name}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Partner retailers reduce prices by up to 70% before expiry. Reserve online, collect in-store, prevent food waste.
          </p>
        </div>

        {/* Quick Highlights Pill Box */}
        <div className="relative z-10 flex items-center gap-3 self-start md:self-auto bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 text-xs shadow-2xs">
          <div className="text-center px-3">
            <span className="block font-black text-xl text-stone-900">
              {products.length}
            </span>
            <span className="text-3xs text-stone-400 uppercase font-semibold">Active Deals</span>
          </div>
          <div className="h-8 w-px bg-stone-200" />
          <div className="text-center px-3">
            <span className="block font-black text-xl text-stone-900">
              {stores.length}
            </span>
            <span className="text-3xs text-stone-400 uppercase font-semibold">Stores</span>
          </div>
        </div>

        {/* Decorative subtle background pattern */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-stone-100/60 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="input-discover-search"
            value={filters.searchQuery || ''}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            placeholder="Search rescue products, bakeries, supermarkets..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200/80 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 shadow-2xs transition-all placeholder:text-stone-400"
          />
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Filter Drawer Button */}
          <button
            type="button"
            id="btn-open-filter-drawer"
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white hover:bg-stone-50 border-stone-200/80 text-stone-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-stone-700 text-white text-2xs font-extrabold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle: Grid vs Map */}
          <div className="flex items-center bg-stone-200/50 backdrop-blur-md p-1 rounded-2xl border border-white/60 relative">
            <button
              type="button"
              id="btn-view-grid"
              onClick={() => setViewMode('grid')}
              className={`relative flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'text-stone-900 font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {viewMode === 'grid' && (
                <motion.div
                  layoutId="view-mode-active-pill"
                  className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </span>
            </button>
            <button
              type="button"
              id="btn-view-map"
              onClick={() => setViewMode('map')}
              className={`relative flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'map'
                  ? 'text-stone-900 font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {viewMode === 'map' && (
                <motion.div
                  layoutId="view-mode-active-pill"
                  className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Map</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <CategorySelector
        selectedCategory={filters.category || 'All'}
        onSelectCategory={handleCategoryChange}
      />

      {/* Main Content Area: Grid or Map */}
      {viewMode === 'map' ? (
        <MapView
          stores={stores}
          products={products}
          heightClass="h-[600px]"
        />
      ) : (
        <div>
          {/* Status / Sorting Bar */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-4 px-1">
            <span>
              Showing <strong className="text-stone-900">{products.length}</strong> rescue deals near{' '}
              <strong className="text-stone-900">{location.name}</strong>
            </span>
            <button
              onClick={loadData}
              className="hover:text-emerald-900 font-medium flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {/* Product Grid or Skeleton */}
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickReserve={handleQuickReserve}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Search}
              title="No rescue deals found"
              description={`We couldn't find any near-expiry products in this category within your selected radius in ${location.name}.`}
              actionText="Reset All Filters"
              onAction={() => {
                setFilters({
                  category: 'All',
                  searchQuery: '',
                  maxDistanceKm: 20,
                  minDiscountPercent: 0,
                  sortBy: 'distance'
                });
              }}
            />
          )}
        </div>
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onChangeFilters={setFilters}
        onReset={() => {
          setFilters({
            category: 'All',
            searchQuery: '',
            maxDistanceKm: 20,
            minDiscountPercent: 0,
            sortBy: 'distance'
          });
        }}
        totalResultsCount={products.length}
      />

      {/* Reservation Flow Modal */}
      {reservingProduct && activeStoreForModal && (
        <ReservationModal
          product={reservingProduct}
          store={activeStoreForModal}
          isOpen={true}
          onClose={() => setReservingProduct(null)}
          onReservationCreated={() => {
            // refresh data to reflect decreased inventory
            loadData();
          }}
        />
      )}
    </div>
  );
};
