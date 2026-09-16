import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BusinessInquiry } from '../types';

export const businessService = {
  async submitInquiry(data: Omit<BusinessInquiry, 'id' | 'createdAt' | 'status'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'businessInquiries'), {
      ...data,
      status: 'new',
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getInquiries(): Promise<BusinessInquiry[]> {
    try {
      const q = query(collection(db, 'businessInquiries'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as BusinessInquiry));
    } catch {
      return [];
    }
  }
};
