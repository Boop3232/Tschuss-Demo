import { ProductCategory } from '../types';

/**
 * Calculates the discounted rescue price strictly without negative values or float inaccuracies.
 * e.g., 2.50 original at 70% discount = 0.75.
 */
export function calculateRescuePrice(originalPrice: number, discountPercent: number): number {
  if (originalPrice <= 0) return 0;
  const clampedDiscount = Math.max(0, Math.min(100, discountPercent));
  const discounted = originalPrice * (1 - clampedDiscount / 100);
  return Math.round(discounted * 100) / 100;
}

/**
 * Calculates Haversine distance in kilometers between two coordinates.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

/**
 * Formats distance for user display (e.g., "0.4 km" or "850 m")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Checks if a date has expired
 */
export function isExpired(expiryDateString?: string | null): boolean {
  if (!expiryDateString) return false;
  const expiry = new Date(expiryDateString).getTime();
  if (isNaN(expiry)) return false;
  const now = Date.now();
  return expiry < now;
}

/**
 * Formats expiry relative to current time
 */
export function formatExpiry(
  expiryDateString?: string | null,
  lang: 'en' | 'de' = 'en'
): { text: string; urgency: 'critical' | 'warning' | 'normal' | 'expired' } {
  if (!expiryDateString) {
    return {
      text: lang === 'de' ? 'Läuft heute ab' : 'Expires today',
      urgency: 'normal'
    };
  }

  const expiry = new Date(expiryDateString);
  if (isNaN(expiry.getTime())) {
    return {
      text: lang === 'de' ? 'Läuft heute ab' : 'Expires today',
      urgency: 'normal'
    };
  }

  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs <= 0) {
    return {
      text: lang === 'de' ? 'Abgelaufen' : 'Expired',
      urgency: 'expired'
    };
  }

  // Same calendar day check
  const isToday =
    expiry.getDate() === now.getDate() &&
    expiry.getMonth() === now.getMonth() &&
    expiry.getFullYear() === now.getFullYear();

  if (isToday || diffHours < 16) {
    return {
      text: lang === 'de' ? 'Läuft heute ab' : 'Expires today',
      urgency: 'critical'
    };
  }

  // Tomorrow check
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    expiry.getDate() === tomorrow.getDate() &&
    expiry.getMonth() === tomorrow.getMonth() &&
    expiry.getFullYear() === tomorrow.getFullYear();

  if (isTomorrow || diffHours < 40) {
    return {
      text: lang === 'de' ? 'Läuft morgen ab' : 'Expires tomorrow',
      urgency: 'warning'
    };
  }

  const days = Math.ceil(diffHours / 24);
  return {
    text: lang === 'de' ? `Läuft in ${days} Tagen ab` : `Expires in ${days} days`,
    urgency: 'normal'
  };
}

/**
 * Transparent environmental impact calculation
 * Assumptions:
 * - Average food waste footprint: ~2.5 kg CO2e per 1 kg food waste diverted (FAO / UNEP benchmark)
 * - Average estimated weight per product: ~0.45 kg unless specific weight is given
 */
export const IMPACT_CONFIG = {
  CO2E_PER_KG_FOOD: 2.5, // kg CO2e avoided per kg food saved
  DEFAULT_WEIGHT_KG: 0.45,
  METHODOLOGY_NOTE: 'Impact estimates are calculated using the standard FAO/UNEP emission factor of 2.5 kg CO2e avoided per kg of food waste diverted from landfill/incineration.'
};

export function calculateEnvironmentalImpact(
  productsCount: number,
  totalSavedEuros: number,
  knownWeightKg?: number
): {
  co2eAvoidedKg: number;
  foodDivertedKg: number;
  moneySaved: number;
} {
  const foodDivertedKg = knownWeightKg && knownWeightKg > 0
    ? Math.round(knownWeightKg * 100) / 100
    : Math.round(productsCount * IMPACT_CONFIG.DEFAULT_WEIGHT_KG * 100) / 100;

  const co2eAvoidedKg = Math.round(foodDivertedKg * IMPACT_CONFIG.CO2E_PER_KG_FOOD * 100) / 100;

  return {
    co2eAvoidedKg: Math.round(co2eAvoidedKg * 100) / 100,
    foodDivertedKg: Math.round(foodDivertedKg * 100) / 100,
    moneySaved: Math.round(totalSavedEuros * 100) / 100
  };
}

/**
 * Formats kilogram values cleanly with at most 2 decimal places and no trailing float noise.
 */
export function formatKg(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Number(val.toFixed(2)).toString();
}

/**
 * Calculates a non-fabricated, composite deal score for ranking
 */
export function calculateDealScore(
  distanceKm: number,
  discountPercent: number,
  expiryAtString: string,
  quantityAvailable: number
): number {
  if (quantityAvailable <= 0 || isExpired(expiryAtString)) return -1;

  // Proximity score: closer gets higher score (max 40 pts)
  const proximityScore = Math.max(0, 40 - Math.min(distanceKm, 20) * 2);

  // Discount score: 0 to 40 pts
  const discountScore = (Math.min(discountPercent, 90) / 90) * 40;

  // Urgency score: expires sooner gets prioritized up to 20 pts
  const diffHours = (new Date(expiryAtString).getTime() - Date.now()) / (1000 * 60 * 60);
  let urgencyScore = 5;
  if (diffHours <= 18) urgencyScore = 20;
  else if (diffHours <= 42) urgencyScore = 15;
  else if (diffHours <= 72) urgencyScore = 10;

  return Math.round(proximityScore + discountScore + urgencyScore);
}

/**
 * Formats Euros cleanly
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Reservation Cancellation Window Policy:
 * Consumers can cancel active reservations up to 10 minutes (600,000 ms) after reserving.
 */
export const CANCELLATION_WINDOW_MINUTES = 10;
export const CANCELLATION_WINDOW_MS = CANCELLATION_WINDOW_MINUTES * 60 * 1000;

/**
 * Safely parses Firestore timestamp, ISO string, milliseconds, or Date object into a Date.
 */
export function parseDateSafe(dateValue: any): Date {
  if (!dateValue) return new Date();
  if (typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  if (typeof dateValue === 'object' && 'seconds' in dateValue) {
    return new Date(dateValue.seconds * 1000);
  }
  if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    const d = new Date(dateValue);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

/**
 * Calculates seconds remaining in the 10-minute cancellation window.
 * Returns 0 if expired or not active.
 */
export function getCancellationRemainingSeconds(createdAt: any): number {
  const createdDate = parseDateSafe(createdAt);
  const elapsedMs = Date.now() - createdDate.getTime();
  const remainingMs = CANCELLATION_WINDOW_MS - elapsedMs;
  return Math.max(0, Math.floor(remainingMs / 1000));
}

/**
 * Checks whether cancellation is currently allowed for this reservation.
 */
export function isCancellationAllowed(createdAt: any, status: string): boolean {
  const isActive = status === 'PENDING' || status === 'CONFIRMED' || status === 'READY';
  if (!isActive) return false;
  return getCancellationRemainingSeconds(createdAt) > 0;
}

/**
 * Formats remaining seconds into MM:SS format (e.g. 09:42).
 */
export function formatRemainingTimer(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

