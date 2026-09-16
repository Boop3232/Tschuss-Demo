import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  MapPin, 
  Clock, 
  Store as StoreIcon, 
  Share2, 
  ShieldCheck, 
  ExternalLink, 
  ShoppingBag,
  Sparkles,
  Info
} from 'lucide-react';
import { Product, Store } from '../../types';
import { productService } from '../../services/productService';
import { storeService } from '../../services/storeService';
import { savedService } from '../../services/savedService';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { DiscountBadge } from '../../components/common/DiscountBadge';
import { PriceDisplay } from '../../components/common/PriceDisplay';
import { formatExpiry, formatDistance, calculateDistance, formatCurrency } from '../../utils/businessLogic';
import { ReservationModal } from '../../components/consumer/ReservationModal';
import { ProductCard } from '../../components/consumer/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { location } = useLocation();

  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const userId = currentUser?.uid || userProfile?.uid || 'guest_user';

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const prod = await productService.getProductById(id);
        if (prod) {
          setProduct(prod);

          const [storeData, allProds] = await Promise.all([
            storeService.getStoreById(prod.storeId),
            productService.getProducts({ category: prod.category })
          ]);

          setStore(storeData);
          setSimilarProducts(allProds.filter(p => p.id !== prod.id).slice(0, 3));
        }

        const saved = await savedService.isProductSaved(userId, id);
        setIsSaved(saved);
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, userId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-900 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-stone-500 mb-6">This item may have been collected or expired.</p>
        <Link
          to="/app/discover"
          className="px-5 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-bold"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const handleToggleSave = async () => {
    const updated = await savedService.toggleSave(userId, product.id);
    setIsSaved(updated);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Rescue ${product.name} at ${product.storeName} with ${product.discountPercent}% OFF on Tschüss!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const expiryInfo = formatExpiry(product.expiryAt);
  const distanceKm = store 
    ? calculateDistance(location.lat, location.lng, store.latitude, store.longitude)
    : 1.2;

  const fallbackStore: Store = store || {
    id: product.storeId,
    name: product.storeName,
    ownerId: '',
    address: product.storeAddress || 'Kleve',
    city: product.storeCity || 'Kleve',
    latitude: product.storeLat || 51.7891,
    longitude: product.storeLng || 6.1381,
    openingHours: 'Mon-Sat 08:00 - 21:00',
    phone: '+49 2821 97810',
    categories: [product.category],
    status: 'active'
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="w-9 h-9 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-600 transition-colors"
            title="Share deal"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToggleSave}
            className={`w-9 h-9 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center transition-colors ${
              isSaved ? 'text-rose-500 fill-rose-500' : 'text-stone-600'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save deal'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {copiedLink && (
        <div className="bg-stone-900 text-white text-xs px-4 py-2 rounded-xl text-center">
          Link copied to clipboard!
        </div>
      )}

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Image with Badges */}
        <div className="relative aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          <div className="absolute top-4 left-4">
            <DiscountBadge percent={product.discountPercent} size="lg" />
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <span className="bg-stone-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl">
              {product.quantityAvailable} units remaining
            </span>
            <span className="bg-white/95 backdrop-blur-md text-stone-900 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-xs">
              {product.category}
            </span>
          </div>
        </div>

        {/* Right Column: Pricing, Store, Details & Reserve */}
        <div className="space-y-6">
          <div>
            {/* Store & Distance Row */}
            <Link
              to={`/app/stores/${product.storeId}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline mb-2"
            >
              <StoreIcon className="w-4 h-4" />
              <span>{product.storeName}</span>
              <span className="text-stone-400">•</span>
              <span className="text-stone-600 font-medium">{formatDistance(distanceKm)} away</span>
            </Link>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {product.unit && (
              <p className="text-xs text-stone-500 mt-1">Package size: {product.unit}</p>
            )}
          </div>

          {/* Pricing Highlight Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between">
            <div>
              <span className="text-3xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                Rescue Deal Price
              </span>
              <PriceDisplay
                originalPrice={product.originalPrice}
                rescuePrice={product.rescuePrice}
                size="lg"
                showSavings={true}
              />
            </div>
            <div className="text-right">
              <span className="text-3xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                Discount
              </span>
              <span className="text-2xl font-black text-emerald-800">
                -{product.discountPercent}%
              </span>
            </div>
          </div>

          {/* Expiry Urgency Alert */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">{expiryInfo.text}</span>
              <span className="text-amber-800/80">
                Pick up during store hours today before inventory is recycled.
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                Product Details
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Store Location & Pickup Information */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs text-stone-700">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-stone-900 block">{store?.name || product.storeName}</span>
                <span className="text-stone-500 block">{store?.address || product.storeAddress}</span>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${fallbackStore.latitude},${fallbackStore.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-2xs font-bold text-emerald-800 hover:underline flex items-center gap-0.5"
              >
                Directions
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2.5 pt-2 border-t border-stone-200/60">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Opening hours: {store?.openingHours || 'Mon-Sat 08:00 - 21:00'}</span>
            </div>

            {store?.pickupInstructions && (
              <div className="flex items-start gap-2.5 pt-2 border-t border-stone-200/60 text-2xs text-stone-600">
                <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{store.pickupInstructions}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="button"
              id="btn-reserve-product-page"
              onClick={() => setIsReserveModalOpen(true)}
              disabled={product.quantityAvailable <= 0}
              className="w-full py-4 bg-emerald-900 hover:bg-emerald-800 active:scale-98 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Reserve Now — Pay {formatCurrency(product.rescuePrice)} in Store</span>
            </button>
            <p className="text-center text-3xs text-stone-400 mt-2">
              Free reservation. Payment is collected in person at store checkout.
            </p>
          </div>
        </div>
      </div>

      {/* Similar Rescue Deals */}
      {similarProducts.length > 0 && (
        <div className="pt-8 border-t border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-stone-900">
              More Rescue Deals in {product.category}
            </h3>
            <Link
              to={`/app/discover?category=${product.category}`}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarProducts.map((simProd) => (
              <ProductCard
                key={simProd.id}
                product={simProd}
                onQuickReserve={() => {
                  setProduct(simProd);
                  setIsReserveModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reservation Flow Modal */}
      {isReserveModalOpen && (
        <ReservationModal
          product={product}
          store={fallbackStore}
          isOpen={true}
          onClose={() => setIsReserveModalOpen(false)}
          onReservationCreated={() => {
            // refresh product details if needed
          }}
        />
      )}
    </div>
  );
};
