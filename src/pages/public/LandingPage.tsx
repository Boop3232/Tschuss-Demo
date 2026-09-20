import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
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
  Smile,
  Zap,
  Tag
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

import { CategoryCarousel } from '../../components/landing/CategoryCarousel';

import heroFoodPlatterImg from '../../assets/images/hero_food_platter_1789649138608.jpg';
import gourmetDeliSurplusImg from '../../assets/images/gourmet_deli_surplus_1789649157523.jpg';
import freshGroceriesBasketImg from '../../assets/images/fresh_groceries_basket_1789648225376.jpg';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useLocation();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [reservingProduct, setReservingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Scroll Progress Hooks
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax shifts for background glows
  const yBgGlow1 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const yBgGlow2 = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const yBgGlow3 = useTransform(scrollYProgress, [0, 1], [0, 80]);

  // Mobile background video ref for guaranteed autoplay
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (mobileVideoRef.current) {
      mobileVideoRef.current.play().catch(() => {
        // Autoplay handled by browser policies
      });
    }
  }, []);

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
    <div ref={containerRef} className="space-y-16 pb-16 relative bg-white text-stone-900">
      {/* Scroll Progress Bar at the top */}
      <motion.div
        className="fixed top-16 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 z-30 origin-left"
        style={{ scaleX }}
      />

      {/* Hero Section with Light Canvas & Image Showcase */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-50 via-white to-stone-50/40 pt-12 pb-16 sm:pt-18 sm:pb-24 border-b border-stone-200/80">
        {/* Soft luminous ambient glows */}
        <motion.div 
          style={{ y: yBgGlow1 }}
          className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div 
          style={{ y: yBgGlow2 }}
          className="absolute top-20 right-1/4 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div 
          style={{ y: yBgGlow3 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[32rem] h-64 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" 
        />

        {/* Tech grid subtle pattern */}
        <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          {/* Top Row: Hero Text + Hero Image side-by-side on lg screens */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Col: Headlines & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6 relative py-4 sm:py-6 px-1 sm:px-3">
              {/* Mobile Lightweight Background - fast, zero-lag, no thermal GPU throttling */}
              <div 
                id="hero-mobile-video-bg"
                className="lg:hidden absolute -inset-x-2 -inset-y-3 sm:-inset-x-4 sm:-inset-y-4 z-0 rounded-3xl overflow-hidden pointer-events-none shadow-xs border border-emerald-900/10 bg-gradient-to-b from-emerald-50/70 via-stone-50/50 to-white"
              >
                <img
                  src={heroFoodPlatterImg}
                  alt="Fresh rescue foods"
                  loading="eager"
                  className="w-full h-full object-cover object-center opacity-25 filter blur-xs scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/95" />
              </div>

              {/* Pilot Location Badge */}
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-300 text-emerald-900 text-2xs sm:text-xs font-bold uppercase tracking-wider shadow-xs max-w-full truncate"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shadow-xs shrink-0" />
                <span className="truncate">Retail Food Rescue · Pilot {location.name}</span>
              </motion.div>

              {/* Title & Tagline with Smooth Entry */}
              <motion.div 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
                className="space-y-4 relative z-10"
              >
                <h1 className="text-3xl xs:text-4xl sm:text-5xl xl:text-6xl font-black font-display tracking-tight text-stone-950 leading-[1.1] break-words hyphens-auto">
                  Profit from <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">Near Food Expiry</span>.
                </h1>
                <div className="max-w-xl mx-auto lg:mx-0">
                  <p className="text-sm sm:text-base lg:text-lg text-stone-800 lg:text-stone-700 font-normal leading-relaxed bg-white/80 lg:bg-transparent backdrop-blur-xs px-3 py-2 sm:px-3.5 sm:py-2.5 lg:p-0 rounded-2xl border border-white/90 lg:border-transparent shadow-2xs lg:shadow-none break-words">
                    Tschüss brings local supermarkets, bakeries, and conscious shoppers together. Retailers rescue lost margin — consumers enjoy up to 70% off high-quality, delicious goods.
                  </p>
                </div>
              </motion.div>

              {/* Call to Actions with Hover Spring */}
              <motion.div 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2 relative z-10"
              >
                <Link
                  to="/app/discover"
                  id="hero-btn-discover"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95 hover:-translate-y-0.5 cursor-pointer no-underline"
                >
                  <Compass className="w-4 h-4 text-white" />
                  <span>Explore Deals in {location.name}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-100" />
                </Link>

                <Link
                  to="/business"
                  id="hero-btn-retailer"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/95 hover:bg-white text-stone-800 hover:text-stone-900 border border-stone-200/90 hover:border-amber-400 font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 hover:-translate-y-0.5 no-underline cursor-pointer backdrop-blur-xs"
                >
                  <StoreIcon className="w-4 h-4 text-amber-600" />
                  <span>Retailer Operations Hub</span>
                </Link>
              </motion.div>
            </div>

            {/* Right Col: Appealing Hero Image Card with Float Badges */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200/90 bg-stone-100 group">
                <img 
                  src={heroFoodPlatterImg} 
                  alt="Appetizing gourmet surplus food dishes, artisan breads, pasta, and tarts"
                  referrerPolicy="no-referrer"
                  className="w-full h-72 sm:h-88 lg:h-96 object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/20 to-transparent pointer-events-none" />

                {/* Floating Info Badges */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
                  <div className="bg-white/95 backdrop-blur-md text-stone-900 px-3.5 py-1.5 rounded-2xl border border-white/60 shadow-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold">100% Quality Inspected</span>
                  </div>
                  <div className="bg-emerald-600/95 backdrop-blur-md text-white px-3 py-1.5 rounded-2xl border border-emerald-400/40 shadow-lg text-xs font-black">
                    Up to -70% OFF
                  </div>
                </div>

                {/* Top Corner Floating Tag */}
                <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-2xs font-semibold flex items-center gap-1.5 border border-white/20">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <span>Daily food rescue in Kleve</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Automatic Moving Category Carousel (Inspired by Image 2) */}
      <CategoryCarousel />

      {/* Featured Deals Section with Scroll Reveal */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-2xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>Live Surplus Radar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display tracking-tight">
              Featured Surplus Deals in {location.name}
            </h2>
          </div>

          <Link
            to="/app/discover"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors group no-underline"
          >
            <span>View all active deals</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Cards Grid with Staggered Fade-in */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
              }}
            >
              <ProductCard
                product={product}
                onQuickReserve={(p) => setReservingProduct(p)}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Dual Value Proposition with Side-Sliding Scroll Animation & Visual Imagery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Consumer Pillar (Clean White + Emerald Accents + Basket Image) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="bg-white rounded-3xl p-7 sm:p-8 border border-emerald-200/90 hover:border-emerald-400 shadow-sm hover:shadow-md space-y-6 transition-all flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Header & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300 shadow-2xs">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  For Local Shoppers
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-stone-900 font-display">
                  Eat Well, Pay Less, Save Food.
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Supermarket groceries, bakery specialties, and gourmet treats often get discarded simply because their sell-by date is near, despite being in peak edible condition.
                </p>
              </div>

              {/* Consumer Pillar Image */}
              <div className="relative rounded-2xl overflow-hidden h-48 sm:h-56 bg-stone-100 border border-stone-200 shadow-inner group">
                <img 
                  src={freshGroceriesBasketImg} 
                  alt="Fresh market groceries in a basket ready for pickup"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 text-white text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Fresh daily pickups at your favorite neighborhood stores</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-700 font-medium">
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
            </div>

            <Link
              to="/app/discover"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 pt-2 transition-colors group no-underline"
            >
              <span>Start Rescuing Today</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Retailer Pillar (Clean White + Amber Accents + Supermarket Counter Image) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="bg-white rounded-3xl p-7 sm:p-8 border border-amber-200/90 hover:border-amber-400 shadow-sm hover:shadow-md space-y-6 transition-all flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Header & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300 shadow-2xs">
                  <StoreIcon className="w-6 h-6" />
                </div>
                <span className="text-2xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  For Retailers & Supermarkets
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-stone-900 font-display">
                  Turn Write-Offs into Margin & Footfall.
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Supermarkets lose thousands of euros each month to organic discard. Tschüss turns shrink into revenue while bringing motivated foot traffic directly into your aisles.
                </p>
              </div>

              {/* Retailer Pillar Image */}
              <div className="relative rounded-2xl overflow-hidden h-48 sm:h-56 bg-stone-100 border border-stone-200 shadow-inner group">
                <img 
                  src={gourmetDeliSurplusImg} 
                  alt="High-end supermarket bakery and gourmet deli surplus foods ready for rescue"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 text-white text-xs font-bold flex items-center gap-1.5">
                  <StoreIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span>30-second surplus item upload with automated markdowns</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-700 font-medium">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Predictive markdown engine recommends optimal pricing</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Fast 30-second surplus item listing process</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Detailed ESG reporting & waste reduction analytics (CSV)</span>
                </li>
              </ul>
            </div>

            <Link
              to="/for-business"
              className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-900 pt-2 transition-colors group no-underline"
            >
              <span>Partner Onboarding Details</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it Works 4 Steps (Interactive Staggered Scroll Lift) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto space-y-2"
        >
          <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display tracking-tight pt-1">
            How Tschüss Operates
          </h2>
          <p className="text-xs text-stone-600">
            A frictionless loop from supermarket shelf to kitchen table.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.12 }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {[
            { step: 1, title: 'Retailers List Surplus', desc: 'Stores upload items nearing expiry with rule-based markdown recommendations.', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', hover: 'hover:border-emerald-400' },
            { step: 2, title: 'Shoppers Discover & Reserve', desc: 'Nearby consumers browse by location and secure items instantly on the web app.', color: 'bg-amber-100 text-amber-800 border-amber-300', hover: 'hover:border-amber-400' },
            { step: 3, title: 'Pick Up In-Store', desc: 'Show your reservation code at the store desk during store hours and pay at checkout.', color: 'bg-sky-100 text-sky-800 border-sky-300', hover: 'hover:border-sky-400' },
            { step: 4, title: 'Track Real Telemetry', desc: 'Both parties view verified statistics: euros saved, shrink avoided, and CO2e spared.', color: 'bg-teal-100 text-teal-800 border-teal-300', hover: 'hover:border-teal-400' }
          ].map((item) => (
            <motion.div
              key={item.step}
              variants={{
                hidden: { opacity: 0, y: 28, scale: 0.96 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } }
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3 ${item.hover} transition-all cursor-default`}
            >
              <span className={`w-8 h-8 rounded-xl ${item.color} font-black text-xs flex items-center justify-center border shadow-xs`}>
                {item.step}
              </span>
              <h4 className="font-bold text-sm text-stone-900">{item.title}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Live Community Impact Showcase Banner */}
      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.99 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-emerald-950 rounded-3xl p-6 sm:p-10 lg:p-12 text-white relative overflow-hidden shadow-xl border border-stone-800">
          {/* Subtle glowing ambient lights - hidden on small mobile to maximize 60fps performance */}
          <div className="hidden sm:block absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="hidden sm:block absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center md:text-left items-center">
            <div className="space-y-2 md:col-span-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-2xs font-bold uppercase tracking-wider border border-emerald-500/40 shadow-xs">
                <Leaf className="w-3.5 h-3.5" />
                <span>Our Shared Impact</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white break-words">
                Every meal saved matters.
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Join our growing network of conscious consumers and forward-thinking supermarkets in {location.name}.
              </p>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center hover:border-emerald-500/40 transition-colors">
                <span className="block text-2xl sm:text-3xl font-black text-emerald-400">1,420+</span>
                <span className="text-3xs text-stone-300 uppercase font-bold tracking-wide">Meals Rescued</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center hover:border-amber-500/40 transition-colors">
                <span className="block text-2xl sm:text-3xl font-black text-amber-400">€5,800+</span>
                <span className="text-3xs text-stone-300 uppercase font-bold tracking-wide">Shopper Savings</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center hover:border-teal-500/40 transition-colors">
                <span className="block text-2xl sm:text-3xl font-black text-teal-400">3.2t</span>
                <span className="text-3xs text-stone-300 uppercase font-bold tracking-wide">CO2e Diverted</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

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
