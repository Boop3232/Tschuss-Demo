import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Store as StoreIcon, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingDown, 
  Leaf, 
  Coins, 
  QrCode,
  Clock,
  Compass,
  Heart,
  Smile
} from 'lucide-react';
import { Product, Store } from '../../types';
import { productService } from '../../services/productService';
import { storeService } from '../../services/storeService';
import { impactService } from '../../services/impactService';
import { useLocation } from '../../context/LocationContext';
import { ProductCard } from '../../components/consumer/ProductCard';
import { ReservationModal } from '../../components/consumer/ReservationModal';
import { formatCurrency } from '../../utils/businessLogic';
import { seedDemoDataIfEmpty } from '../../services/seedDataService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useLocation();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [reservingProduct, setReservingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        await seedDemoDataIfEmpty();
        const [prods, storeList] = await Promise.all([
          productService.getProducts({}, location),
          storeService.getStores()
        ]);
        setFeaturedProducts(prods.slice(0, 4));
        setStores(storeList);
      } catch (e) {
        console.error('Failed to load landing:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location]);

  const activeStoreForModal = reservingProduct
    ? stores.find(s => s.id === reservingProduct.storeId) || {
        id: reservingProduct.storeId,
        name: reservingProduct.storeName,
        ownerId: '',
        address: reservingProduct.storeAddress || 'Kleve',
        city: reservingProduct.storeCity || 'Kleve',
        latitude: reservingProduct.storeLat || 51.7891,
        longitude: reservingProduct.storeLng || 6.1381,
        openingHours: 'Mon-Sat 08:00 - 21:00',
        phone: '+49 2821 97810',
        categories: ['Grocery'],
        status: 'active'
      }
    : null;

  return (
    <div className="space-y-16 pb-16">
      {/* Cheerful, Lighter Pastel Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/90 via-amber-50/40 to-[#FAF9F5] pt-14 pb-20 sm:pt-20 sm:pb-28 border-b border-emerald-100/60">
        {/* Soft pastel decorative floating blurs */}
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-96 h-60 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-7">
          {/* Cheerful Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-2xs backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Connecting Retailers and Consumers</span>
          </div>

          {/* Title & Cheerful Tagline */}
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-stone-900 leading-[1.08]">
              Profit from <span className="text-emerald-600">Near Food Expiry</span>.
            </h1>
            <p className="text-base sm:text-lg text-stone-600 font-medium max-w-2xl mx-auto leading-relaxed">
              Tschüss brings local supermarkets, bakeries, and smart shoppers together. Retailers rescue lost margin — consumers enjoy up to 70% off high-quality, delicious goods.
            </p>
          </div>

          {/* Cheerful Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              to="/app/discover"
              id="hero-btn-discover"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-sm hover:shadow-emerald-200/80 flex items-center justify-center gap-2 active:scale-95"
            >
              <Compass className="w-4 h-4 text-white" />
              <span>Explore Deals in {location.name}</span>
            </Link>

            <Link
              to="/business"
              id="hero-btn-retailer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-amber-50/70 text-stone-800 border border-stone-200/80 font-bold text-sm transition-all shadow-2xs flex items-center justify-center gap-2"
            >
              <StoreIcon className="w-4 h-4 text-amber-700" />
              <span>Retailer Dashboard</span>
            </Link>
          </div>

          {/* Cheerful Pastel Highlights Grid */}
          <div className="pt-8 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-emerald-200/60 shadow-2xs text-center">
              <span className="block text-2xl font-black text-emerald-800">Up to 70%</span>
              <span className="text-3xs text-stone-500 uppercase font-bold tracking-wide">Markdown Savings</span>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-amber-200/60 shadow-2xs text-center">
              <span className="block text-2xl font-black text-amber-800">0% Waste</span>
              <span className="text-3xs text-stone-500 uppercase font-bold tracking-wide">Store Shrink Goal</span>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-sky-200/60 shadow-2xs text-center">
              <span className="block text-2xl font-black text-sky-800">100% Free</span>
              <span className="text-3xs text-stone-500 uppercase font-bold tracking-wide">Zero Upfront Fee</span>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-purple-200/60 shadow-2xs text-center">
              <span className="block text-2xl font-black text-purple-800">Kleve, NRW</span>
              <span className="text-3xs text-stone-500 uppercase font-bold tracking-wide">Active Pilot City</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Deals Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200/70 text-2xs font-bold uppercase tracking-wider mb-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Rescue Marketplace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display tracking-tight">
              Featured Surplus Deals in {location.name}
            </h2>
          </div>

          <Link
            to="/app/discover"
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
          >
            <span>View all active deals</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </Link>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickReserve={(p) => setReservingProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Dual Value Proposition in Soft Pastels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consumer Pillar (Soft Mint Pastel) */}
          <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/40 rounded-3xl p-8 border border-emerald-200/70 shadow-2xs space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-700 flex items-center justify-center shadow-2xs border border-emerald-200/60">
              <ShoppingBag className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider">
                For Local Shoppers
              </span>
              <h3 className="text-2xl font-black text-stone-900 font-display">
                Eat Well, Pay Less, Save Food.
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Supermarket groceries, bakery specialties, and gourmet treats often get discarded simply because their sell-by date is near, despite being in peak edible condition.
              </p>
            </div>

            <ul className="space-y-3 text-xs text-stone-700 font-medium">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Browse real-time store inventories with deep discounts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reserve items in seconds with zero upfront fee</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Show pickup code at the counter and pay regular checkout</span>
              </li>
            </ul>

            <Link
              to="/app/discover"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900 hover:text-emerald-700 pt-2 transition-colors"
            >
              <span>Start Rescuing Today</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Retailer Pillar (Soft Apricot/Honey Pastel) */}
          <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/40 rounded-3xl p-8 border border-amber-200/70 shadow-2xs space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-white text-amber-800 flex items-center justify-center shadow-2xs border border-amber-200/60">
              <StoreIcon className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="text-2xs font-bold text-amber-800 uppercase tracking-wider">
                For Retailers & Supermarkets
              </span>
              <h3 className="text-2xl font-black text-stone-900 font-display">
                Turn Write-Offs into Profit & Footfall.
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Supermarkets lose thousands of euros each month to organic discard. Tschüss turns shrink into revenue while bringing motivated foot traffic directly into your aisles.
              </p>
            </div>

            <ul className="space-y-3 text-xs text-stone-700 font-medium">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Predictive markdown engine recommends optimal pricing</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Fast 30-second surplus item listing process</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Detailed ESG reporting & waste reduction analytics (CSV)</span>
              </li>
            </ul>

            <Link
              to="/for-business"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 hover:text-amber-700 pt-2 transition-colors"
            >
              <span>Partner Onboarding Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works 4 Steps (Minimalist with Soft Pastel Badges) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display tracking-tight">
            How Tschüss Works
          </h2>
          <p className="text-xs text-stone-500">
            A frictionless loop from store shelf to kitchen table.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/70 shadow-2xs space-y-3 hover:border-emerald-200 transition-colors">
            <span className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 font-black text-xs flex items-center justify-center border border-emerald-200/60">
              1
            </span>
            <h4 className="font-bold text-sm text-stone-900">Retailers List Surplus</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Stores upload items nearing expiry with rule-based markdown recommendations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/70 shadow-2xs space-y-3 hover:border-amber-200 transition-colors">
            <span className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-800 font-black text-xs flex items-center justify-center border border-amber-200/60">
              2
            </span>
            <h4 className="font-bold text-sm text-stone-900">Shoppers Discover & Reserve</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Nearby consumers browse by location and secure items instantly on the web app.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/70 shadow-2xs space-y-3 hover:border-sky-200 transition-colors">
            <span className="w-8 h-8 rounded-xl bg-sky-100/80 text-sky-800 font-black text-xs flex items-center justify-center border border-sky-200/60">
              3
            </span>
            <h4 className="font-bold text-sm text-stone-900">Pick Up In-Store</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Show your reservation code at the store desk during store hours and pay at checkout.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/70 shadow-2xs space-y-3 hover:border-purple-200 transition-colors">
            <span className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-800 font-black text-xs flex items-center justify-center border border-purple-200/60">
              4
            </span>
            <h4 className="font-bold text-sm text-stone-900">Track Real Impact</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Both parties view verified statistics: euros saved, shrink avoided, and CO2e spared.
            </p>
          </div>
        </div>
      </section>

      {/* Reservation Modal if triggered from landing page */}
      {reservingProduct && activeStoreForModal && (
        <ReservationModal
          product={reservingProduct}
          store={activeStoreForModal}
          isOpen={true}
          onClose={() => setReservingProduct(null)}
          onReservationCreated={() => navigate('/app/reservations')}
        />
      )}
    </div>
  );
};
