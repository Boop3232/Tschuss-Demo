export type UserRole = 'consumer' | 'retailer' | 'admin';

export type ProductCategory = 
  | 'Grocery' 
  | 'Bakery' 
  | 'Cosmetics' 
  | 'Flowers' 
  | 'Drinks' 
  | 'Household' 
  | 'Other';

export type ProductStatus = 'draft' | 'active' | 'paused' | 'sold_out' | 'expired';

export type ReservationStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'READY' 
  | 'COLLECTED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'EXPIRED';

export interface UserLocation {
  name: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  photoURL?: string;
  phone?: string;
  language: 'en' | 'de';
  preferredLocation?: UserLocation;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    dealsNearMe: boolean;
    reservationUpdates: boolean;
    savedPriceDrops: boolean;
  };
  createdAt?: string | Date | any;
  updatedAt?: string | Date | any;
}

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  phone: string;
  categories: ProductCategory[];
  status: 'active' | 'paused' | 'pending';
  imageUrl?: string;
  description?: string;
  pickupInstructions?: string;
  createdAt?: string | Date | any;
  updatedAt?: string | Date | any;
}

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  storeAddress?: string;
  storeCity?: string;
  storeLat?: number;
  storeLng?: number;
  name: string;
  description: string;
  category: ProductCategory;
  imageUrl: string;
  originalPrice: number;
  discountPercent: number;
  rescuePrice: number;
  quantityAvailable: number;
  unit?: string;
  expiryAt: string;
  pickupStartTime?: string;
  pickupEndTime?: string;
  status: ProductStatus;
  estimatedWeightKg?: number;
  createdAt?: string | Date | any;
  updatedAt?: string | Date | any;
}

export interface ReservationItem {
  productId: string;
  name: string;
  imageUrl: string;
  originalPrice: number;
  rescuePrice: number;
  quantity: number;
  total: number;
  category: ProductCategory;
  estimatedWeightKg?: number;
}

export interface Reservation {
  id: string;
  reservationCode: string;
  consumerId: string;
  consumerName: string;
  consumerEmail: string;
  consumerPhone?: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  storePhone?: string;
  storeLat: number;
  storeLng: number;
  items: ReservationItem[];
  totalAmount: number;
  totalSaved: number;
  totalWeightKg: number;
  pickupWindow: string;
  pickupDeadline: string;
  status: ReservationStatus;
  cancellationReason?: string;
  createdAt?: string | Date | any;
  updatedAt?: string | Date | any;
  collectedAt?: string | Date | any;
}

export interface SavedProduct {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt?: string | Date | any;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reservation_status' | 'deal_alert' | 'price_drop' | 'stock_alert' | 'system';
  targetUrl?: string;
  read: boolean;
  createdAt?: string | Date | any;
}

export interface ImpactEvent {
  id: string;
  consumerId: string;
  storeId: string;
  reservationId: string;
  productsRescued: number;
  moneySaved: number;
  co2eAvoidedKg: number;
  foodDivertedKg: number;
  timestamp: string | Date | any;
}

export interface BusinessInquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  storeCount: string;
  message: string;
  status: 'new' | 'contacted' | 'approved';
  createdAt?: string | Date | any;
}

export interface FilterOptions {
  category?: ProductCategory | 'All';
  searchQuery?: string;
  maxDistanceKm?: number;
  minDiscountPercent?: number;
  maxPrice?: number;
  storeId?: string;
  expiryUrgency?: 'all' | 'today' | 'tomorrow' | '2days';
  sortBy?: 'distance' | 'cheapest' | 'discount' | 'expiry' | 'newest';
  includeAllStatuses?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: { label: string; path: string }[];
}

export interface ChatApiResponse {
  reply: string;
  suggestedActions?: { label: string; path: string }[];
  error?: string;
}

