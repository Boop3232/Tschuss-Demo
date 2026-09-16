import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { Store, Product } from '../../types';
import { useLocation } from '../../context/LocationContext';
import { Navigation, MapPin, Store as StoreIcon, ExternalLink, ShoppingBag, X } from 'lucide-react';
import { formatCurrency, formatDistance, calculateDistance } from '../../utils/businessLogic';

interface MapViewProps {
  stores: Store[];
  products: Product[];
  selectedStoreId?: string | null;
  onSelectStore?: (store: Store) => void;
  heightClass?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  stores,
  products,
  selectedStoreId,
  onSelectStore,
  heightClass = 'h-[calc(100vh-140px)]'
}) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const { location, requestCurrentLocation, isLoadingLocation } = useLocation();
  const [activeStore, setActiveStore] = useState<Store | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      center: [location.lat, location.lng],
      zoom: 14,
      zoomControl: false
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when location changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.lat, location.lng], mapInstanceRef.current.getZoom() || 14);

      // Render User Marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-7 h-7 bg-emerald-500 rounded-full animate-ping opacity-40"></span>
            <div class="w-4 h-4 bg-emerald-700 border-2 border-white rounded-full shadow-md"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      userMarkerRef.current = L.marker([location.lat, location.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<strong>Your Location</strong><br/>${location.name}`);
    }
  }, [location]);

  // Update Store Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    stores.forEach((store) => {
      // Find active products in this store
      const storeProducts = products.filter(p => p.storeId === store.id && p.status === 'active' && p.quantityAvailable > 0);
      const productCount = storeProducts.length;

      const pinIcon = L.divIcon({
        className: 'custom-store-pin',
        html: `
          <div class="group cursor-pointer flex flex-col items-center">
            <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-stone-900 hover:bg-emerald-900 text-white shadow-lg border border-white transition-all transform hover:scale-110">
              <span class="w-2 h-2 rounded-full ${productCount > 0 ? 'bg-emerald-400' : 'bg-stone-400'}"></span>
              <span class="text-xs font-extrabold tracking-tight">${store.name.split(' ')[0]}</span>
              <span class="bg-emerald-500 text-stone-950 font-black text-2xs px-1.5 py-0.5 rounded-full">${productCount}</span>
            </div>
            <div class="w-2 h-2 bg-stone-900 transform rotate-45 -mt-1 border-r border-b border-white"></div>
          </div>
        `,
        iconSize: [120, 36],
        iconAnchor: [60, 36]
      });

      const marker = L.marker([store.latitude, store.longitude], { icon: pinIcon }).addTo(map);

      marker.on('click', () => {
        setActiveStore(store);
        if (onSelectStore) onSelectStore(store);
      });

      markersRef.current.push(marker);
    });
  }, [stores, products, onSelectStore]);

  const activeStoreProducts = activeStore 
    ? products.filter(p => p.storeId === activeStore.id && p.status === 'active' && p.quantityAvailable > 0)
    : [];

  const storeDistance = activeStore
    ? calculateDistance(location.lat, location.lng, activeStore.latitude, activeStore.longitude)
    : 0;

  const handleCenterUser = async () => {
    await requestCurrentLocation();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.lat, location.lng], 15);
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs`}>
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Map Action Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-stone-200/80 pointer-events-auto flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-800" />
          <span className="text-xs font-bold text-stone-800">{location.name}</span>
          <span className="text-stone-400 text-xs">•</span>
          <span className="text-xs text-stone-500">{stores.length} Partner Stores</span>
        </div>

        <button
          type="button"
          onClick={handleCenterUser}
          disabled={isLoadingLocation}
          className="bg-white hover:bg-stone-50 text-stone-800 p-2.5 rounded-xl shadow-md border border-stone-200/80 pointer-events-auto flex items-center gap-1.5 text-xs font-bold transition-transform active:scale-95"
          title="Center on my location"
        >
          <Navigation className={`w-4 h-4 text-emerald-800 ${isLoadingLocation ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>

      {/* Selected Store Bottom Card */}
      {activeStore && (
        <div className="absolute bottom-5 left-4 right-4 sm:left-auto sm:right-5 sm:w-96 z-10 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-white rounded-3xl p-4 shadow-2xl border border-stone-200 relative overflow-hidden">
            <button
              onClick={() => setActiveStore(null)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
              aria-label="Close store card"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Store details */}
            <div className="flex items-start gap-3 mb-3 pr-6">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                <img
                  src={activeStore.imageUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80'}
                  alt={activeStore.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-stone-900 text-sm truncate">{activeStore.name}</h4>
                <p className="text-xs text-stone-500 truncate">{activeStore.address}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {formatDistance(storeDistance)} away
                  </span>
                  <span className="text-2xs text-stone-500 font-medium">
                    {activeStore.openingHours?.split(',')[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Rescue Deals In Store */}
            <div className="border-t border-stone-100 pt-2.5 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-stone-700">Available Rescue Deals</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                  {activeStoreProducts.length} items
                </span>
              </div>

              {activeStoreProducts.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {activeStoreProducts.slice(0, 3).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => navigate(`/app/products/${prod.id}`)}
                      className="flex items-center justify-between p-2 rounded-xl bg-stone-50 hover:bg-emerald-50/60 cursor-pointer border border-stone-200/60 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span className="font-medium text-stone-900 truncate">{prod.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-bold text-emerald-950">{formatCurrency(prod.rescuePrice)}</span>
                        <span className="text-2xs font-extrabold bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">
                          -{prod.discountPercent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 py-1">No active rescue items at this moment.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${activeStore.latitude},${activeStore.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Directions
              </a>

              <button
                onClick={() => navigate(`/app/stores/${activeStore.id}`)}
                className="flex-1 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                View Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
