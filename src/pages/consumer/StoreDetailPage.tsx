import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
  ExternalLink, 
  Sparkles, 
  ShoppingBag,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Store, Product } from '../../types';
import { storeService } from '../../services/storeService';
import { productService } from '../../services/productService';
import { useLocation } from '../../context/LocationContext';
import { ProductCard } from '../../components/consumer/ProductCard';
import { ReservationModal } from '../../components/consumer/ReservationModal';
import { calculateDistance, formatDistance } from '../../utils/businessLogic';

export const StoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { location } = useLocation();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservingProduct, setReservingProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadStore() {
      if (!id) return;
      setLoading(true);
      try {
        const [storeData, storeProducts] = await Promise.all([
          storeService.getStoreById(id),
          productService.getProducts({ storeId: id })
        ]);
        setStore(storeData);
        setProducts(storeProducts);
      } catch (err) {
        console.error('Error loading store:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-900 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Store Not Found</h2>
        <Link to="/app/discover" className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const distanceKm = calculateDistance(location.lat, location.lng, store.latitude, store.longitude);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Store Header Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="relative h-48 sm:h-64 w-full bg-stone-900">
          <img
            src={store.imageUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80'}
            alt={store.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />

          <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-2xs font-bold uppercase tracking-wider">
                  Verified Partner Store
                </span>
                <span className="text-stone-300 text-xs font-medium">
                  {formatDistance(distanceKm)} away
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
                {store.name}
              </h1>
              <p className="text-xs sm:text-sm text-stone-200 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {store.address}, {store.city}
              </p>
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-white text-stone-900 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-md transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>

        {/* Store Detail Specs */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-100 bg-stone-50/50 text-xs text-stone-700">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block">Opening Hours</span>
              <span className="text-stone-600">{store.openingHours || 'Mon-Sat 08:00 - 21:00'}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block">Contact Phone</span>
              <span className="text-stone-600">{store.phone || '+49 2821 97810'}</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block">Pickup Location</span>
              <span className="text-stone-600 leading-snug">
                {store.pickupInstructions || 'Proceed to checkout or customer service station.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Rescue Deals in this Store */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              Active Rescue Deals ({products.length})
            </h2>
            <p className="text-xs text-stone-500">
              Discounted items currently available for pickup at {store.name}
            </p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickReserve={(p) => setReservingProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200">
            <ShoppingBag className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-800">No active surplus items today</p>
            <p className="text-xs text-stone-500 mt-1">
              Check back this evening as near-expiry products are marked down.
            </p>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {reservingProduct && (
        <ReservationModal
          product={reservingProduct}
          store={store}
          isOpen={true}
          onClose={() => setReservingProduct(null)}
        />
      )}
    </div>
  );
};
