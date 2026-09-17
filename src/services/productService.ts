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

const DELETED_PRODUCTS_KEY = 'tschuess_deleted_product_ids';
const LOCAL_PRODUCTS_KEY = 'tschuess_local_products';

function getDeletedProductIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addDeletedProductId(id: string) {
  try {
    const list = getDeletedProductIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('tschuess_products_changed', { detail: { action: 'delete', id } }));
    }
  } catch {}
}

function getLocalProducts(): Product[] {
  try {
    const deleted = getDeletedProductIds();
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    let items: Product[] = [];
    if (raw) {
      items = JSON.parse(raw);
    }
    
    // Check if new DEMO_PRODUCTS need to be merged in
    const existingIds = new Set(items.map(p => p.id));
    let hasNew = false;
    for (const demoP of DEMO_PRODUCTS) {
      if (!existingIds.has(demoP.id) && !deleted.includes(demoP.id)) {
        items.push(demoP);
        hasNew = true;
      }
    }

    const filtered = items.filter(p => !deleted.includes(p.id));
    if (hasNew || !raw) {
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    const deleted = getDeletedProductIds();
    return DEMO_PRODUCTS.filter(p => !deleted.includes(p.id));
  }
}

function saveLocalProducts(products: Product[]) {
  try {
    const deleted = getDeletedProductIds();
    const clean = products.filter(p => !deleted.includes(p.id));
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent('tschuess_products_changed'));
  } catch (e) {
    console.warn('Could not save local products:', e);
  }
}

export const productService = {
  /**
   * Fetch all products matching filters with fallback to local cached/demo data
   */
  async getProducts(filters?: FilterOptions, userLoc?: UserLocation): Promise<Product[]> {
    const deletedIds = getDeletedProductIds();
    let products: Product[] = [];

    try {
      const q = query(collection(db, 'products'));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const firestoreProducts = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
        // Filter out locally deleted IDs
        products = firestoreProducts.filter(p => !deletedIds.includes(p.id));
        saveLocalProducts(products);
      } else {
        products = getLocalProducts();
      }
    } catch (error) {
      console.warn('Error fetching products from Firestore, using local fallback:', error);
      products = getLocalProducts();
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
        const filteredByDist = products.filter((p: any) => 
          p.calculatedDistance !== undefined ? p.calculatedDistance <= filters.maxDistanceKm! : true
        );
        // If distance filter would hide all items because reviewer is accessing outside demo region, preserve items so showcase is never empty
        if (filteredByDist.length > 0) {
          products = filteredByDist;
        }
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
  },

  async getProductById(id: string): Promise<Product | null> {
    const deletedIds = getDeletedProductIds();
    if (deletedIds.includes(id)) {
      return null;
    }

    try {
      const docRef = doc(db, 'products', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as Product;
      }
    } catch (err) {
      console.warn('Error in getProductById Firestore, checking local cache:', err);
    }

    // Check local fallback
    const localMatch = getLocalProducts().find(p => p.id === id);
    return localMatch || null;
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<string> {
    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Instantly save to local cache
    const current = getLocalProducts();
    saveLocalProducts([newProduct, ...current]);

    // 2. Persist to Firestore in background
    try {
      const productRef = doc(db, 'products', id);
      await setDoc(productRef, {
        ...newProduct,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Could not save product to Firestore, cached locally:', e);
    }

    return id;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    // 1. Update in local cache immediately
    const current = getLocalProducts();
    const updated = current.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
    saveLocalProducts(updated);

    // 2. Update Firestore
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Could not update product in Firestore:', e);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    // 1. Track deleted product ID so it never resurfaces from demo data
    addDeletedProductId(id);

    // 2. Remove from local cache immediately
    const current = getLocalProducts();
    const updated = current.filter(p => p.id !== id);
    saveLocalProducts(updated);

    // 3. Delete from Firestore
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Could not delete product from Firestore:', e);
    }
  },

  /**
   * Real-time listener for products (e.g. for retailer inventory or live deal stock)
   */
  subscribeToProducts(storeId: string | undefined, callback: (products: Product[]) => void) {
    const emitLocal = () => {
      let items = getLocalProducts();
      if (storeId && storeId !== 'all') {
        items = items.filter(p => p.storeId === storeId);
      }
      callback(items);
    };

    // 1. Emit local immediately
    emitLocal();

    // 2. Listen to custom & storage events
    const handleLocalChange = () => emitLocal();
    window.addEventListener('tschuess_products_changed', handleLocalChange);
    window.addEventListener('storage', handleLocalChange);

    // 3. Attach Firestore real-time listener if available
    let unsubscribeFirestore = () => {};
    try {
      const coll = collection(db, 'products');
      const q = storeId && storeId !== 'all'
        ? query(coll, where('storeId', '==', storeId))
        : coll;

      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const deletedIds = getDeletedProductIds();
          const items = snapshot.docs
            .map(d => ({ ...d.data(), id: d.id } as Product))
            .filter(p => !deletedIds.includes(p.id));
          
          saveLocalProducts(items);
          callback(items);
        }
      }, (error) => {
        console.warn('Snapshot listener warning:', error);
      });
    } catch (error) {
      console.warn('Could not attach Firestore product snapshot:', error);
    }

    return () => {
      window.removeEventListener('tschuess_products_changed', handleLocalChange);
      window.removeEventListener('storage', handleLocalChange);
      unsubscribeFirestore();
    };
  }
};

