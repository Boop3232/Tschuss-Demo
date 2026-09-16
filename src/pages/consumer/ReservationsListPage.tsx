import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Store as StoreIcon, 
  QrCode, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight,
  Timer
} from 'lucide-react';
import { Reservation } from '../../types';
import { reservationService } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  formatCurrency, 
  getCancellationRemainingSeconds, 
  formatRemainingTimer 
} from '../../utils/businessLogic';
import { EmptyState } from '../../components/common/EmptyState';

export const ReservationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  const consumerId = currentUser?.uid || userProfile?.uid || 'demo_consumer_123';

  useEffect(() => {
    setLoading(true);
    const unsubscribe = reservationService.subscribeToReservations(
      { consumerId },
      (items) => {
        setReservations(items);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [consumerId]);

  const activeReservations = reservations.filter(
    r => r.status === 'PENDING' || r.status === 'CONFIRMED' || r.status === 'READY'
  );

  const pastReservations = reservations.filter(
    r => r.status === 'COLLECTED' || r.status === 'COMPLETED' || r.status === 'CANCELLED' || r.status === 'EXPIRED'
  );

  const displayedList = activeTab === 'active' ? activeReservations : pastReservations;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">
            My Reservations
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Collect reserved items in-store by showing your pickup code to store staff.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-stone-200/50 backdrop-blur-md p-1 rounded-2xl border border-white/60 self-start sm:self-auto relative">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`relative px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'active'
                ? 'text-stone-900 font-extrabold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {activeTab === 'active' && (
              <motion.div
                layoutId="reservations-tab-active-pill"
                className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative z-10">Active ({activeReservations.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`relative px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'past'
                ? 'text-stone-900 font-extrabold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {activeTab === 'past' && (
              <motion.div
                layoutId="reservations-tab-active-pill"
                className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative z-10">Past History ({pastReservations.length})</span>
          </button>
        </div>
      </div>

      {/* Reservation Cards List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-stone-200 rounded-2xl" />
          ))}
        </div>
      ) : displayedList.length > 0 ? (
        <div className="space-y-4">
          {displayedList.map((res) => (
            <div
              key={res.id}
              onClick={() => navigate(`/app/reservations/${res.id}`)}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs hover:shadow-md hover:border-emerald-700/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                  <QrCode className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-extrabold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                      #{res.reservationCode}
                    </span>
                    <StatusBadge status={res.status} />
                    {(res.status === 'PENDING' || res.status === 'CONFIRMED' || res.status === 'READY') && 
                     getCancellationRemainingSeconds(res.createdAt) > 0 && (
                      <span className="inline-flex items-center gap-1 text-2xs font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                        <Timer className="w-3 h-3 text-amber-700" />
                        {formatRemainingTimer(getCancellationRemainingSeconds(res.createdAt))} left to cancel
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-stone-900 flex items-center gap-1.5">
                    <StoreIcon className="w-4 h-4 text-emerald-800 shrink-0" />
                    {res.storeName}
                  </h3>

                  <div className="text-xs text-stone-500 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {res.pickupWindow}
                    </span>
                    <span>•</span>
                    <span>{res.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                  </div>
                </div>
              </div>

              {/* Price & Savings */}
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                <div className="text-left sm:text-right">
                  <span className="text-2xs text-stone-400 font-medium block">Total in store</span>
                  <span className="text-lg font-black text-emerald-950">
                    {formatCurrency(res.totalAmount)}
                  </span>
                  <span className="text-2xs text-emerald-700 font-bold block">
                    Saved {formatCurrency(res.totalSaved)}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-stone-600 sm:mt-2">
                  <span>Details</span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={activeTab === 'active' ? 'No active reservations' : 'No past reservations'}
          description={
            activeTab === 'active'
              ? 'You have no open food rescue orders right now. Check out discounted surplus items available today!'
              : 'Completed and picked up reservations will appear here.'
          }
          actionText="Discover Deals"
          onAction={() => navigate('/app/discover')}
        />
      )}
    </div>
  );
};
