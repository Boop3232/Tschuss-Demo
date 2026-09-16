import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, FilterOptions, UserLocation } from '../types';
import { calculateDistance, isExpired, calculateDealScore } from '../utils/businessLogic';
import { DEMO_PRODUCTS } from './seedDataService';

export const productService = {
  /**
   * Fetch all products matching filters with fallback to demo data if Firestore collection is brand new
   */
  async getProducts(filters?: FilterOptions, userLoc?: UserLocation): Promise<Product[]> {
    try {
      const q = query(collection(db, 'products'));
      const snap = await getDocs(q);
      
      let products: Product[] = [];
      if (!snap.empty) {
        products = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
      } else {
        // Fallback to local demo list if database is currently unseeded
        products = [...DEMO_PRODUCTS];
      }

      // Automatically identify expired products
      products = products.map(p => {
        if (p.status === 'active' && isExpired(p.expiryAt)) {
          return { ...p, status: 'expired' as const };
        }
        return p;
      });

      // Filter by active status for consumer listings (unless retailer filtered by store)
      if (!filters?.storeId) {
        products = products.filter(p => p.status === 'active' && p.quantityAvailable > 0);
      } else {
        products = products.filter(p => p.storeId === filters.storeId);
      }

      // Filter by category
      if (filters?.category && filters.category !== 'All') {
        products = products.filter(p => p.category === filters.category);
      }

      // Filter by search query
      if (filters?.searchQuery && filters.searchQuery.trim().length > 0) {
        const queryLower = filters.searchQuery.toLowerCase().trim();
        products = products.filter(p => 
          p.name.toLowerCase().includes(queryLower) ||
          p.storeName.toLowerCase().includes(queryLower) ||
          p.category.toLowerCase().includes(queryLower) ||
          (p.description && p.description.toLowerCase().includes(queryLower))
        );
      }

      // Filter by discount
      if (filters?.minDiscountPercent !== undefined && filters.minDiscountPercent > 0) {
        products = products.filter(p => p.discountPercent >= filters.minDiscountPercent!);
      }

      // Filter by max price
      if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
        products = products.filter(p => p.rescuePrice <= filters.maxPrice!);
      }

      // Distance calculation and radius filter
      if (userLoc) {
        products = products.map(p => {
          if (p.storeLat && p.storeLng) {
            const dist = calculateDistance(userLoc.lat, userLoc.lng, p.storeLat, p.storeLng);
            return { ...p, calculatedDistance: dist };
          }
          return p;
        });

        if (filters?.maxDistanceKm && filters.maxDistanceKm > 0) {
          products = products.filter((p: any) => 
            p.calculatedDistance !== undefined ? p.calculatedDistance <= filters.maxDistanceKm! : true
          );
        }
      }

      // Sorting
      const sortBy = filters?.sortBy || 'distance';
      products.sort((a: any, b: any) => {
        if (sortBy === 'cheapest') {
          return a.rescuePrice - b.rescuePrice;
        } else if (sortBy === 'discount') {
          return b.discountPercent - a.discountPercent;
        } else if (sortBy === 'expiry') {
          return new Date(a.expiryAt).getTime() - new Date(b.expiryAt).getTime();
        } else if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        } else {
          // Distance / Deal score ranking
          const distA = a.calculatedDistance ?? 1.5;
          const distB = b.calculatedDistance ?? 1.5;
          const scoreA = calculateDealScore(distA, a.discountPercent, a.expiryAt, a.quantityAvailable);
          const scoreB = calculateDealScore(distB, b.discountPercent, b.expiryAt, b.quantityAvailable);
          return scoreB - scoreA;
        }
      });

      return products;
    } catch (error) {
      console.warn('Error fetching products from Firestore, falling back to demo products:', error);
      return DEMO_PRODUCTS;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as Product;
      }
      // Check demo fallback
      const demoMatch = DEMO_PRODUCTS.find(p => p.id === id);
      return demoMatch || null;
    } catch (err) {
      console.warn('Error in getProductById, checking demo list:', err);
      return DEMO_PRODUCTS.find(p => p.id === id) || null;
    }
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<string> {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const productRef = doc(db, 'products', id);
    const newProduct: Product = {
      ...product,
      id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(productRef, newProduct);
    return id;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
  },

  /**
   * Real-time listener for products (e.g. for retailer inventory or live deal stock)
   */
  subscribeToProducts(storeId: string | undefined, callback: (products: Product[]) => void) {
    const coll = collection(db, 'products');
    const q = storeId 
      ? query(coll, where('storeId', '==', storeId))
      : coll;

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Product));
      callback(items.length > 0 ? items : (storeId ? DEMO_PRODUCTS.filter(p => p.storeId === storeId) : DEMO_PRODUCTS));
    }, (error) => {
      console.warn('Snapshot listener error, returning demo data:', error);
      callback(storeId ? DEMO_PRODUCTS.filter(p => p.storeId === storeId) : DEMO_PRODUCTS);
    });
  }
};
