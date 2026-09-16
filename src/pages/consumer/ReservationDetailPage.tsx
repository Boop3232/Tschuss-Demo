import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Store as StoreIcon, 
  Clock, 
  MapPin, 
  Phone, 
  ExternalLink, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle,
  AlertCircle,
  XCircle,
  Timer,
  Loader2,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Reservation, ReservationStatus } from '../../types';
import { reservationService } from '../../services/reservationService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  formatCurrency, 
  formatRemainingTimer, 
  getCancellationRemainingSeconds,
  CANCELLATION_WINDOW_MINUTES,
  parseDateSafe
} from '../../utils/businessLogic';

export const ReservationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [customReason, setCustomReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await reservationService.getReservationById(id);
        setReservation(res);
      } catch (err) {
        console.error('Error loading reservation:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const isActive = reservation 
    ? (reservation.status === 'PENDING' || reservation.status === 'CONFIRMED' || reservation.status === 'READY')
    : false;

  // Live countdown timer for 10-minute cancellation window
  useEffect(() => {
    if (!reservation || !isActive) {
      setTimeLeftSeconds(0);
      return;
    }

    const updateTimer = () => {
      const remaining = getCancellationRemainingSeconds(reservation.createdAt);
      setTimeLeftSeconds(remaining);
      return remaining;
    };

    const initialRemaining = updateTimer();
    if (initialRemaining <= 0) return;

    const interval = setInterval(() => {
      const remaining = updateTimer();
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation?.id, reservation?.createdAt, reservation?.status, isActive]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-900 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-2">Reservation Not Found</h2>
        <Link to="/app/reservations" className="text-xs font-bold text-emerald-800 hover:underline">
          Back to Reservations
        </Link>
      </div>
    );
  }

  const handleCancelReservation = async () => {
    setActionError(null);
    setActionSuccess(null);
    setIsCancelling(true);

    const finalReason = cancelReason === 'Other' && customReason.trim()
      ? customReason.trim()
      : cancelReason;

    try {
      // Pass isConsumerRequest: true to enforce the 10-minute window
      await reservationService.updateReservationStatus(reservation.id, 'CANCELLED', finalReason, true);
      
      setReservation(prev => prev ? { 
        ...prev, 
        status: 'CANCELLED', 
        cancellationReason: finalReason,
        updatedAt: new Date().toISOString()
      } : null);

      setIsCancelDialogOpen(false);
      setActionSuccess('Reservation cancelled successfully. The reserved stock has been released back to the store.');
    } catch (err: any) {
      console.error('Cancellation error:', err);
      setActionError(err?.message || 'Could not cancel reservation. The cancellation window may have expired.');
    } finally {
      setIsCancelling(false);
    }
  };

  const isEligibleForCancellation = isActive && timeLeftSeconds > 0;
  const isCancelled = reservation.status === 'CANCELLED';
  const progressPercent = Math.min(100, Math.max(0, (timeLeftSeconds / (CANCELLATION_WINDOW_MINUTES * 60)) * 100));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/app/reservations')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>All Reservations</span>
      </button>

      {/* Success banner */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Reservation Cancelled</span>
            <p className="text-emerald-800 mt-0.5">{actionSuccess}</p>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error banner */}
      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Action Failed</span>
            <p className="text-rose-800 mt-0.5">{actionError}</p>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-700 hover:text-rose-950 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Reservation Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-6 sm:p-8 space-y-6">
        {/* Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Reservation
              </span>
              <StatusBadge status={reservation.status} size="md" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Order #{reservation.reservationCode}
            </h1>
            <span className="text-xs text-stone-400 block mt-0.5">
              Booked {parseDateSafe(reservation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {parseDateSafe(reservation.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xs text-stone-400 font-medium block">Total to Pay at Store</span>
            <span className="text-2xl font-black text-emerald-950">
              {formatCurrency(reservation.totalAmount)}
            </span>
            <span className="text-xs font-bold text-emerald-700 block">
              Saved {formatCurrency(reservation.totalSaved)}
            </span>
          </div>
        </div>

        {/* Cancellation Notice for Cancelled Orders */}
        {isCancelled && (
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1.5 text-xs text-rose-950">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>This reservation was cancelled</span>
            </div>
            <p className="text-stone-600">
              Reason: <span className="font-semibold text-stone-800">{reservation.cancellationReason || 'Requested by customer'}</span>
            </p>
            <p className="text-stone-500 text-2xs">
              Items were released back into the store’s available inventory. No payment was charged.
            </p>
          </div>
        )}

        {/* Active Pickup Code Display */}
        {isActive && (
          <div className="bg-stone-900 text-white rounded-2xl p-6 text-center space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Pickup Code for Cashier
            </span>
            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-stone-800 rounded-2xl border border-stone-700 text-3xl font-mono font-black tracking-widest text-white shadow-inner">
              <QrCode className="w-7 h-7 text-emerald-400" />
              <span>{reservation.reservationCode}</span>
            </div>
            <p className="text-xs text-stone-300 max-w-sm mx-auto">
              Show this screen or quote code #{reservation.reservationCode} at checkout. Pay in store with card or cash.
            </p>
          </div>
        )}

        {/* Pickup Location & Hours */}
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3 text-xs text-stone-700">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <StoreIcon className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 text-sm block">{reservation.storeName}</span>
                <span className="text-stone-500">{reservation.storeAddress}</span>
                {reservation.storePhone && (
                  <span className="text-stone-500 block mt-0.5">Tel: {reservation.storePhone}</span>
                )}
              </div>
            </div>

            {reservation.storeLat && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${reservation.storeLat},${reservation.storeLng}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-800 font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Directions
              </a>
            )}
          </div>

          <div className="flex items-center gap-2.5 pt-2 border-t border-stone-200/60">
            <Clock className="w-4 h-4 text-emerald-800 shrink-0" />
            <span className="font-semibold text-stone-900">
              Pickup window: {reservation.pickupWindow}
            </span>
          </div>
        </div>

        {/* Reserved Items Breakdown */}
        <div>
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
            Reserved Items ({reservation.items.length})
          </h3>
          <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-2xl overflow-hidden">
            {reservation.items.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-stone-900 text-sm block truncate">{item.name}</span>
                    <span className="text-xs text-stone-500">
                      {item.quantity}x @ {formatCurrency(item.rescuePrice)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-stone-900 text-sm block">
                    {formatCurrency(item.total)}
                  </span>
                  <span className="text-2xs text-stone-400 line-through block">
                    {formatCurrency(item.originalPrice * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancellation Section with 10-Minute Timer Policy */}
        {isActive && (
          <div className="pt-5 border-t border-stone-100 space-y-3">
            {isEligibleForCancellation ? (
              /* Within 10-minute cancellation window */
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Timer className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-amber-950">
                          Free Cancellation Window
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900 font-mono font-bold text-xs tracking-wider">
                          {formatRemainingTimer(timeLeftSeconds)} left
                        </span>
                      </div>
                      <p className="text-2xs text-stone-600 mt-0.5">
                        Cancellation is allowed up to 10 minutes after booking before the store sets aside your items.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="btn-cancel-reservation"
                    onClick={() => {
                      setActionError(null);
                      setIsCancelDialogOpen(true);
                    }}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 hover:border-rose-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Reservation</span>
                  </button>
                </div>

                {/* Visual Progress Bar (10 minutes countdown) */}
                <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-amber-600 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              /* Cancellation window expired (exceeded 10 minutes) */
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-800">
                        10-Minute Cancellation Window Closed
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-2xs font-semibold bg-stone-200 text-stone-600">
                        Expired
                      </span>
                    </div>
                    <p className="text-stone-500 leading-relaxed">
                      To prevent food waste and avoid disrupting store packing schedules, reservations can only be cancelled within 10 minutes of reserving.
                    </p>
                    {reservation.storePhone && (
                      <p className="text-stone-500 pt-0.5">
                        If you cannot collect your order, please notify the store directly at{' '}
                        <a href={`tel:${reservation.storePhone}`} className="font-bold text-emerald-800 hover:underline">
                          {reservation.storePhone}
                        </a>.
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled
                    title="Cancellation is only available for 10 minutes after reserving."
                    className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-400 border border-stone-200 text-xs font-semibold cursor-not-allowed shrink-0"
                  >
                    Cancellation Closed
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancellation Dialog with 10-Minute Timer & Reason Selector */}
      {isCancelDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div 
            id="cancel-reservation-modal"
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in zoom-in-95"
          >
            {/* Modal Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-stone-900">
                    Cancel Reservation?
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono font-bold text-xs flex items-center gap-1">
                    <Timer className="w-3 h-3 text-amber-700" />
                    {formatRemainingTimer(timeLeftSeconds)}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Order #{reservation.reservationCode} at {reservation.storeName}
                </p>
              </div>
            </div>

            {/* Explanation & Impact */}
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/70 text-xs text-stone-600 space-y-1.5">
              <p className="font-semibold text-stone-800">
                What happens when you cancel:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-stone-600">
                <li>Reserved items are returned to the store's rescue inventory immediately.</li>
                <li>Another local shopper can rescue the food before store closing.</li>
                <li>You will not be charged anything at the counter.</li>
              </ul>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Reason for cancellation:
              </label>
              <div className="space-y-1.5">
                {[
                  'Change of plans / schedule',
                  'Reserved by mistake',
                  'Cannot reach pickup location in time',
                  'Found alternative items',
                  'Other'
                ].map((reasonOption) => (
                  <label 
                    key={reasonOption}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      cancelReason === reasonOption 
                        ? 'border-emerald-700 bg-emerald-50/50 text-emerald-950 font-bold' 
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reasonOption}
                      checked={cancelReason === reasonOption}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="text-emerald-800 focus:ring-emerald-700"
                    />
                    <span>{reasonOption}</span>
                  </label>
                ))}
              </div>

              {cancelReason === 'Other' && (
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please specify reason..."
                  maxLength={100}
                  className="w-full mt-2 px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsCancelDialogOpen(false)}
                disabled={isCancelling}
                className="px-4 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors disabled:opacity-50"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                id="btn-confirm-cancel-reservation"
                onClick={handleCancelReservation}
                disabled={isCancelling || timeLeftSeconds <= 0}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Yes, Cancel Reservation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

