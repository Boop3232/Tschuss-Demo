import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  ShoppingBag, 
  TrendingUp, 
  Leaf, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  QrCode,
  Tag
} from 'lucide-react';
import { Product, Reservation, Store } from '../../types';
import { productService } from '../../services/productService';
import { reservationService } from '../../services/reservationService';
import { impactService, RetailerImpactStats } from '../../services/impactService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatExpiry } from '../../utils/businessLogic';
import { StatusBadge } from '../../components/common/StatusBadge';
import { pricingRecommendationService } from '../../services/predictiveExpiryService';

export const RetailerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [impact, setImpact] = useState<RetailerImpactStats | null>(null);
  const [loading, setLoading] = useState(true);

  const storeId = 'store_rewe_kleve'; // Demo store partner ID

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [prods, resList, impactData] = await Promise.all([
        productService.getProducts({ storeId }),
        reservationService.getReservationsForStore(storeId),
        impactService.getRetailerImpact(storeId)
      ]);

      setProducts(prods);
      setReservations(resList);
      setImpact(impactData);
    } catch (err) {
      console.error('Error loading retailer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleUpdateReservationStatus = async (id: string, status: any) => {
    await reservationService.updateReservationStatus(id, status);
    loadDashboard();
  };

  // Products expiring within 36 hours
  const urgentProducts = products.filter(p => {
    const diffHours = (new Date(p.expiryAt).getTime() - Date.now()) / (1000 * 3600);
    return diffHours > 0 && diffHours <= 36 && p.status === 'active';
  });

  const pendingReservations = reservations.filter(
    r => r.status === 'PENDING' || r.status === 'CONFIRMED' || r.status === 'READY'
  );

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/90 text-emerald-300 text-2xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            REWE Kleve (Demo Partner Station)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
            Store Overview & Rescue Operations
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-1">
            Manage surplus food inventory, fulfill consumer reservations, and track recovered margin.
          </p>
        </div>

        <Link
          to="/business/products/new"
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Rescue Product</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider">
              Active Listed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-stone-900">
            {products.filter(p => p.status === 'active').length}
          </span>
          <span className="text-3xs text-stone-500 block mt-1">Available for consumer reservation</span>
        </div>

        {/* Nearing Expiry Alert */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider">
              Expires &lt;36h
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-amber-900">
            {urgentProducts.length}
          </span>
          <span className="text-3xs text-amber-700 font-semibold block mt-1">
            Requires discount attention
          </span>
        </div>

        {/* Recovered Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider">
              Recovered Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-950">
            {formatCurrency(impact?.revenueRecovered || 34.20)}
          </span>
          <span className="text-3xs text-emerald-700 font-semibold block mt-1">
            Prevented from write-off
          </span>
        </div>

        {/* CO2e Avoided */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider">
              CO2e Avoided
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-teal-950">
            {impact?.co2eAvoidedKg || 18.5} <span className="text-xs font-normal text-stone-500">kg</span>
          </span>
          <span className="text-3xs text-stone-500 block mt-1">Verified diverted footprint</span>
        </div>
      </div>

      {/* Two Column Layout: Urgent Products & Incoming Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Urgent Expiry Action Board */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Nearing Expiry (Action Recommended)</span>
              </h3>
              <p className="text-2xs text-stone-500">
                Products expiring today or tomorrow. Rule-based pricing suggestions available.
              </p>
            </div>
            <Link to="/business/products" className="text-xs font-bold text-emerald-800 hover:underline">
              View all
            </Link>
          </div>

          {urgentProducts.length > 0 ? (
            <div className="space-y-3">
              {urgentProducts.slice(0, 3).map((prod) => {
                const rec = pricingRecommendationService.getDiscountRecommendation(
                  prod.category,
                  prod.originalPrice,
                  prod.expiryAt,
                  prod.quantityAvailable
                );

                return (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-stone-900 block truncate">{prod.name}</span>
                        <span className="text-2xs text-stone-500 block">
                          Stock: {prod.quantityAvailable} • {formatExpiry(prod.expiryAt).text}
                        </span>
                        <div className="mt-1 flex items-center gap-1.5 text-2xs text-emerald-800 font-semibold">
                          <Tag className="w-3 h-3 text-emerald-700" />
                          <span>Suggested markdown: <strong>-{rec.suggestedDiscountPercent}%</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-stone-900 block text-sm">
                        {formatCurrency(prod.rescuePrice)}
                      </span>
                      <span className="text-2xs text-stone-400 line-through block">
                        {formatCurrency(prod.originalPrice)}
                      </span>
                      <Link
                        to={`/business/products`}
                        className="mt-1.5 inline-block text-2xs font-bold text-emerald-800 hover:underline"
                      >
                        Adjust
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-500">
              No products urgently expiring in the next 36 hours.
            </div>
          )}
        </div>

        {/* Incoming Active Reservations */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-800" />
                <span>Incoming Pickup Reservations</span>
              </h3>
              <p className="text-2xs text-stone-500">
                Shoppers arriving to collect reserved surplus orders today.
              </p>
            </div>
            <Link to="/business/reservations" className="text-xs font-bold text-emerald-800 hover:underline">
              Manage all ({reservations.length})
            </Link>
          </div>

          {pendingReservations.length > 0 ? (
            <div className="space-y-3">
              {pendingReservations.slice(0, 3).map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-stone-200 text-stone-900 px-2 py-0.5 rounded-md">
                        #{res.reservationCode}
                      </span>
                      <StatusBadge status={res.status} />
                    </div>
                    <span className="font-extrabold text-stone-900 text-sm">
                      {formatCurrency(res.totalAmount)}
                    </span>
                  </div>

                  <div className="text-stone-700">
                    <span className="font-semibold">{res.consumerName}</span> • {res.items[0]?.name}{' '}
                    {res.items.length > 1 && `+${res.items.length - 1} more`}
                  </div>

                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                    <span className="text-2xs text-stone-500">{res.pickupWindow}</span>

                    <div className="flex items-center gap-1.5">
                      {res.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateReservationStatus(res.id, 'READY')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xs"
                        >
                          Mark Ready
                        </button>
                      )}
                      {res.status === 'READY' && (
                        <button
                          onClick={() => handleUpdateReservationStatus(res.id, 'COLLECTED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-2xs"
                        >
                          Mark Collected
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-500">
              No pending reservations waiting for fulfillment right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
