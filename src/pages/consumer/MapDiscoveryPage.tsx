import React, { useState, useEffect } from 'react';
import { Store, Product } from '../../types';
import { storeService } from '../../services/storeService';
import { productService } from '../../services/productService';
import { MapView } from '../../components/consumer/MapView';
import { useLocation } from '../../context/LocationContext';
import { Sparkles, MapPin, Store as StoreIcon } from 'lucide-react';

export const MapDiscoveryPage: React.FC = () => {
  const { location } = useLocation();
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, p] = await Promise.all([
          storeService.getStores(),
          productService.getProducts({}, location)
        ]);
        setStores(s);
        setProducts(p);
      } catch (err) {
        console.error('Failed to load map items:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">
            Interactive Store & Rescue Map
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Locate participating supermarkets and bakeries offering near-expiry food discounts in {location.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <MapPin className="w-3.5 h-3.5 text-emerald-800" />
          <span>Centered on {location.name}</span>
        </div>
      </div>

      {/* Map Component */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden p-2">
        <MapView
          stores={stores}
          products={products}
          heightClass="h-[650px]"
        />
      </div>
    </div>
  );
};
