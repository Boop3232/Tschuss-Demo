import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Store } from '../types';
import { DEMO_STORES } from './seedDataService';

export const storeService = {
  async getStores(): Promise<Store[]> {
    try {
      const snap = await getDocs(collection(db, 'stores'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Store));
      }
      return DEMO_STORES;
    } catch (e) {
      console.warn('Error getting stores, using demo fallback:', e);
      return DEMO_STORES;
    }
  },

  async getStoreById(id: string): Promise<Store | null> {
    try {
      const docRef = doc(db, 'stores', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as Store;
      }
      return DEMO_STORES.find(s => s.id === id) || null;
    } catch (e) {
      return DEMO_STORES.find(s => s.id === id) || null;
    }
  },

  async getStoresByOwner(ownerId: string): Promise<Store[]> {
    try {
      const q = query(collection(db, 'stores'), where('ownerId', '==', ownerId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Store));
      }
      return DEMO_STORES.filter(s => s.ownerId === ownerId || s.id === 'store_rewe_kleve');
    } catch (e) {
      return DEMO_STORES.filter(s => s.ownerId === ownerId || s.id === 'store_rewe_kleve');
    }
  },

  async createStore(store: Omit<Store, 'id'>): Promise<string> {
    const id = `store_${Date.now()}`;
    await setDoc(doc(db, 'stores', id), {
      ...store,
      id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return id;
  },

  async updateStore(id: string, updates: Partial<Store>): Promise<void> {
    await updateDoc(doc(db, 'stores', id), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
};
