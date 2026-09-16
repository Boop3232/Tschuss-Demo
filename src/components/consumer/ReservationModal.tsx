import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Store as StoreIcon, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';
import { Product, Store, Reservation } from '../../types';
import { QuantitySelector } from '../common/QuantitySelector';
import { PriceDisplay } from '../common/PriceDisplay';
import { formatCurrency } from '../../utils/businessLogic';
import { reservationService } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';

interface ReservationModalProps {
  product: Product;
  store: Store;
  isOpen: boolean;
  onClose: () => void;
  onReservationCreated?: (res: Reservation) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  product,
  store,
  isOpen,
  onClose,
  onReservationCreated
}) => {
  const navigate = useNavigate();
  const { userProfile, currentUser } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const unitPrice = product.rescuePrice;
  const totalPrice = Math.round(unitPrice * quantity * 100) / 100;
  const totalSavings = Math.round((product.originalPrice - unitPrice) * quantity * 100) / 100;

  const pickupWindow = product.pickupStartTime && product.pickupEndTime
    ? `Today ${product.pickupStartTime} - ${product.pickupEndTime}`
    : 'Today during store hours';

  const pickupDeadline = product.pickupEndTime 
    ? `Today ${product.pickupEndTime}` 
    : 'Before store close';

  const handleConfirmReservation = async () => {
    setSubmitting(true);
    setErrorMessage(null);

    const consumer = userProfile || {
      uid: currentUser?.uid || 'guest_consumer_123',
      name: currentUser?.displayName || 'Hannah Becker',
      email: currentUser?.email || 'hannah.consumer@tschuess.de',
      role: 'consumer' as const,
      phone: '+49 2821 789012',
      language: 'de' as const
    };

    try {
      const reservation = await reservationService.createReservation(
        consumer,
        store,
        product,
        quantity,
        pickupWindow,
        pickupDeadline
      );

      setConfirmedReservation(reservation);
      if (onReservationCreated) onReservationCreated(reservation);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to complete reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        id="reservation-flow-modal"
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-lg text-stone-900">
              {confirmedReservation ? 'Reservation Confirmed' : 'Reserve Rescue Food'}
            </h3>
            <p className="text-xs text-stone-500">
              {confirmedReservation ? 'Show this code at pickup' : 'Pay at the store counter upon collection'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Screen */}
        {confirmedReservation ? (
          <div className="py-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Pickup Reservation Code
              </p>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-stone-900 text-white rounded-2xl font-mono text-2xl font-black tracking-widest shadow-md">
                <QrCode className="w-6 h-6 text-emerald-400" />
                <span>{confirmedReservation.reservationCode}</span>
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Present this code to the store staff when picking up your order.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 text-left border border-stone-200/80 space-y-2.5 text-xs text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-500">Store:</span>
                <span className="font-bold text-stone-900">{store.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Pickup window:</span>
                <span className="font-bold text-stone-900">{confirmedReservation.pickupWindow}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Reserved items:</span>
                <span className="font-bold text-stone-900">{quantity}x {product.name}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200/60 pt-2 text-sm">
                <span className="font-bold text-stone-800">Total to pay at counter:</span>
                <span className="font-extrabold text-emerald-900">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/app/reservations/${confirmedReservation.id}`);
                }}
                className="w-full sm:flex-1 py-3 bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>View My Reservation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold rounded-xl transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* Reservation Form */
          <div className="py-4 space-y-5">
            {/* Product Item Summary */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/70">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-stone-900 text-sm truncate">{product.name}</h4>
                <p className="text-xs text-emerald-800 font-semibold">{store.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-extrabold text-emerald-950">{formatCurrency(product.rescuePrice)}</span>
                  <span className="text-xs text-stone-400 line-through">{formatCurrency(product.originalPrice)}</span>
                  <span className="text-2xs font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">
                    -{product.discountPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200">
              <div>
                <span className="text-sm font-bold text-stone-900 block">Quantity</span>
                <span className="text-xs text-stone-500">{product.quantityAvailable} available in stock</span>
              </div>
              <QuantitySelector
                quantity={quantity}
                max={product.quantityAvailable}
                onChange={setQuantity}
                disabled={submitting}
              />
            </div>

            {/* Pickup Info Card */}
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Pickup Time Window: {pickupWindow}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span>{store.address}, {store.city}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Pay directly at checkout counter in cash or card. No upfront online charge.</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-stone-100 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Rescue price ({quantity}x {formatCurrency(unitPrice)})</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>You save</span>
                <span>-{formatCurrency(totalSavings)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-stone-900 border-t border-stone-200 pt-2">
                <span>Total to pay at store:</span>
                <span className="text-emerald-950 text-xl">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-3 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                id="btn-confirm-reservation-submit"
                onClick={handleConfirmReservation}
                disabled={submitting || product.quantityAvailable <= 0}
                className="flex-1 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 active:scale-98 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reserving Inventory...</span>
                  </>
                ) : (
                  <span>Confirm Reservation ({formatCurrency(totalPrice)})</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
