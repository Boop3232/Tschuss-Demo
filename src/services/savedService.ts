import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { productService } from './productService';
import { Product } from '../types';

export const savedService = {
  async getSavedProducts(userId: string): Promise<Product[]> {
    try {
      const q = query(collection(db, 'savedProducts'), where('userId', '==', userId));
      const snap = await getDocs(q);
      const productIds = snap.docs.map(d => d.data().productId as string);

      if (productIds.length === 0) {
        // Check local storage for quick guest/demo resilience
        const localSaved = JSON.parse(localStorage.getItem(`tschuess_saved_${userId}`) || '[]');
        if (localSaved.length > 0) {
          const prods = await Promise.all(localSaved.map((id: string) => productService.getProductById(id)));
          return prods.filter((p): p is Product => p !== null);
        }
        return [];
      }

      const products = await Promise.all(
        productIds.map(id => productService.getProductById(id))
      );

      return products.filter((p): p is Product => p !== null);
    } catch (e) {
      console.warn('Error fetching saved products, checking local backup:', e);
      const localSaved = JSON.parse(localStorage.getItem(`tschuess_saved_${userId}`) || '[]');
      const prods = await Promise.all(localSaved.map((id: string) => productService.getProductById(id)));
      return prods.filter((p): p is Product => p !== null);
    }
  },

  async isProductSaved(userId: string, productId: string): Promise<boolean> {
    try {
      const id = `${userId}_${productId}`;
      const q = query(
        collection(db, 'savedProducts'), 
        where('userId', '==', userId), 
        where('productId', '==', productId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) return true;

      const localSaved: string[] = JSON.parse(localStorage.getItem(`tschuess_saved_${userId}`) || '[]');
      return localSaved.includes(productId);
    } catch {
      const localSaved: string[] = JSON.parse(localStorage.getItem(`tschuess_saved_${userId}`) || '[]');
      return localSaved.includes(productId);
    }
  },

  async toggleSave(userId: string, productId: string): Promise<boolean> {
    const isSaved = await this.isProductSaved(userId, productId);
    const docId = `${userId}_${productId}`;
    const docRef = doc(db, 'savedProducts', docId);

    // Update local storage backup
    const localSaved: string[] = JSON.parse(localStorage.getItem(`tschuess_saved_${userId}`) || '[]');

    if (isSaved) {
      try {
        await deleteDoc(docRef);
      } catch (e) {
        console.warn('Could not delete saved doc in Firestore:', e);
      }
      const updated = localSaved.filter(id => id !== productId);
      localStorage.setItem(`tschuess_saved_${userId}`, JSON.stringify(updated));
      return false; // Now unsaved
    } else {
      try {
        await setDoc(docRef, {
          id: docId,
          userId,
          productId,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Could not save doc in Firestore:', e);
      }
      localSaved.push(productId);
      localStorage.setItem(`tschuess_saved_${userId}`, JSON.stringify(localSaved));
      return true; // Now saved
    }
  }
};
