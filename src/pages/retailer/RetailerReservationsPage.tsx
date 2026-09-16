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
  Phone
} from 'lucide-react';
import { Reservation, ReservationStatus } from '../../types';
import { reservationService } from '../../services/reservationService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/businessLogic';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const RetailerReservationsPage: React.FC = () => {
  const storeId = 'store_rewe_kleve';

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancellingResId, setCancellingResId] = useState<string | null>(null);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const list = await reservationService.getReservationsForStore(storeId);
      setReservations(list);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: ReservationStatus) => {
    await reservationService.updateReservationStatus(id, newStatus);
    setReservations(reservations.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handleCancelReservation = async () => {
    if (!cancellingResId) return;
    await reservationService.updateReservationStatus(cancellingResId, 'CANCELLED', 'Cancelled by store manager');
    setReservations(reservations.map(r => r.id === cancellingResId ? { ...r, status: 'CANCELLED' } : r));
    setCancellingResId(null);
  };

  const filteredReservations = reservations.filter(r => {
    const matchesQuery = r.reservationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         r.consumerName.toLowerCase().includes(searchQuery.toLowerCase());
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
          Verify customer pickup codes, pack reserved bags, and record in-store cash/card collections.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code (e.g. TS-4829) or consumer name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'CONFIRMED', 'READY', 'COLLECTED', 'CANCELLED'].map((st) => (
            <button
              key={st}
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
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-4"
            >
              {/* Top Row: Code, Status, Consumer, Total */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-stone-900 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>#{res.reservationCode}</span>
                  </div>
                  <StatusBadge status={res.status} />
                  <span className="text-xs text-stone-400 font-medium">
                    Pickup: {res.pickupWindow}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-3xs text-stone-400 uppercase font-bold block">Collect at Counter</span>
                    <span className="text-lg font-black text-emerald-950">
                      {formatCurrency(res.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items in this Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {res.items.map((it, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center gap-2.5">
                    <img
                      src={it.imageUrl}
                      alt={it.name}
                      className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-stone-900 block truncate">{it.name}</span>
                      <span className="text-stone-500 text-2xs">
                        {it.quantity}x @ {formatCurrency(it.rescuePrice)}
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
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mark Ready for Pickup</span>
                    </button>
                  )}

                  {res.status === 'READY' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(res.id, 'COLLECTED')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Handover & Collected</span>
                    </button>
                  )}

                  {(res.status === 'CONFIRMED' || res.status === 'READY') && (
                    <button
                      type="button"
                      onClick={() => setCancellingResId(res.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
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
            New consumer reservations will arrive here in real-time.
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
