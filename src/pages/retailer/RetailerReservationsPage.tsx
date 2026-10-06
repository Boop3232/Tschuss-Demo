import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  Clock, 
  User, 
  QrCode, 
  AlertCircle,
  Check,
  X,
  Phone,
  Store as StoreIcon
} from 'lucide-react';
import { Reservation, ReservationStatus } from '../../types';
import { reservationService } from '../../services/reservationService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/businessLogic';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

const PARTNER_STORES = [
  { id: 'all', name: 'All Partner Stores' },
  { id: 'store_rewe_kleve', name: 'REWE Kleve' },
  { id: 'store_baeckerei_kleve', name: 'Bäckerei & Konditorei' },
  { id: 'store_biomarkt_kleve', name: 'BioMarkt Kleve' },
  { id: 'store_edeka_kleve', name: 'EDEKA Center' },
  { id: 'store_blumen_kleve', name: 'Blumen Floristik' },
];

export const RetailerReservationsPage: React.FC = () => {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancellingResId, setCancellingResId] = useState<string | null>(null);

  // Subscribe to persistent reservations with real-time updates across components
  useEffect(() => {
    setLoading(true);
    const unsubscribe = reservationService.subscribeToReservations(
      { storeId: selectedStore },
      (items) => {
        setReservations(items);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedStore]);

  const handleUpdateStatus = async (id: string, newStatus: ReservationStatus) => {
    // Optimistic immediate update in UI
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    await reservationService.updateReservationStatus(id, newStatus);
  };

  const handleCancelReservation = async () => {
    if (!cancellingResId) return;
    const targetId = cancellingResId;
    setReservations(prev => prev.map(r => r.id === targetId ? { ...r, status: 'CANCELLED' } : r));
    await reservationService.updateReservationStatus(targetId, 'CANCELLED', 'Cancelled by store manager');
    setCancellingResId(null);
  };

  const filteredReservations = reservations.filter(r => {
    const query = searchQuery.trim().toLowerCase();
    const items = Array.isArray(r.items) ? r.items : [];
    const searchableFields = [r.reservationCode, r.consumerName, r.storeName, ...items.map(item => item?.name)];
    const matchesQuery = !query || searchableFields.some(value =>
      typeof value === 'string' && value.toLowerCase().includes(query)
    );
    const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">
          In-Store Pickups & Reservations
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Verify customer pickup codes, pack reserved bags, and record in-store collections. Updates persist automatically.
        </p>
      </div>

      {/* Store Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-2xs font-bold text-stone-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <StoreIcon className="w-3.5 h-3.5 text-stone-500" />
          Location:
        </span>
        <div className="flex items-center gap-1.5">
          {PARTNER_STORES.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStore(st.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedStore === st.id
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              {st.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code (e.g. TS-4829), customer name, or item..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'CONFIRMED', 'READY', 'COLLECTED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                statusFilter === st
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Reservation Cards List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-stone-200 rounded-2xl" />
          ))}
        </div>
      ) : filteredReservations.length > 0 ? (
        <div className="space-y-4">
          {filteredReservations.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-4 transition-all hover:border-stone-300"
            >
              {/* Top Row: Code, Status, Store, Pickup Window, Total */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="px-3 py-1 bg-stone-900 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>#{res.reservationCode || res.id}</span>
                  </div>
                  <StatusBadge status={res.status} />
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-2xs font-semibold border border-stone-200/80">
                    {res.storeName}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">
                    Pickup: {res.pickupWindow}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-3xs text-stone-400 uppercase font-bold block">Collect at Counter</span>
                    <span className="text-lg font-black text-emerald-950">
                      {formatCurrency(res.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items in this Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {(Array.isArray(res.items) ? res.items : []).map((it, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center gap-2.5">
                    <img
                      src={it?.imageUrl || ''}
                      alt={it?.name || 'Reserved item'}
                      className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-stone-900 block truncate">{it?.name || 'Reserved item'}</span>
                      <span className="text-stone-500 text-2xs">
                        {it?.quantity ?? 0}x @ {formatCurrency(it?.rescuePrice ?? 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Row: Consumer Details & Action Triggers */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-semibold text-stone-900">{res.consumerName}</span>
                  {res.consumerPhone && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        {res.consumerPhone}
                      </span>
                    </>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {res.status === 'CONFIRMED' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(res.id, 'READY')}
                      className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mark Ready for Pickup</span>
                    </button>
                  )}

                  {res.status === 'READY' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(res.id, 'COLLECTED')}
                      className="px-4 py-1.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Handover & Collected</span>
                    </button>
                  )}

                  {(res.status === 'CONFIRMED' || res.status === 'READY') && (
                    <button
                      type="button"
                      onClick={() => setCancellingResId(res.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs transition-colors"
                      title="Cancel reservation"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-stone-900 text-base">No reservations found</h3>
          <p className="text-xs text-stone-500 mt-1">
            {selectedStore === 'all' 
              ? 'New consumer reservations will arrive here in real-time.' 
              : 'No reservations for this store branch. Switch to "All Partner Stores" to see orders across all locations.'}
          </p>
        </div>
      )}

      {/* Cancel reservation dialog */}
      <ConfirmDialog
        isOpen={!!cancellingResId}
        title="Cancel this consumer reservation?"
        message="The customer will receive an immediate cancellation alert and the item will be restored to store inventory."
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        isDestructive={true}
        onConfirm={handleCancelReservation}
        onCancel={() => setCancellingResId(null)}
      />
    </div>
  );
};
