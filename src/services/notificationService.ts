import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppNotification } from '../types';

const INITIAL_DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    userId: 'demo_consumer_123',
    title: 'Ready for Pickup',
    message: 'Your reservation #TS-4829 for Creamy Greek Style Yoghurt at REWE Kleve is packed and ready.',
    type: 'reservation_status',
    targetUrl: '/app/reservations/res_demo_001',
    read: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 'notif_2',
    userId: 'demo_consumer_123',
    title: '50% Flash Markdown',
    message: 'Organic Barista Oat Drink at BioMarkt Kleve just got discounted to €1.03.',
    type: 'deal_alert',
    targetUrl: '/app/products/prod_bio_oat_milk',
    read: true,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif_3',
    userId: 'demo_consumer_123',
    title: 'Low Stock Alert',
    message: 'Only 3 units left of Soothing Chamomile Night Cream at BioMarkt Kleve.',
    type: 'stock_alert',
    targetUrl: '/app/products/prod_face_cream',
    read: true,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  }
];

export const notificationService = {
  async getNotifications(userId: string): Promise<AppNotification[]> {
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as AppNotification));
      }
      return INITIAL_DEMO_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_DEMO_NOTIFICATIONS;
    }
  },

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: AppNotification['type'],
    targetUrl?: string
  ): Promise<string> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    try {
      await setDoc(doc(db, 'notifications', id), {
        id,
        userId,
        title,
        message,
        type,
        targetUrl: targetUrl || '',
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Could not write notification to Firestore:', e);
    }
    return id;
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', id), {
        read: true,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Could not update notification in Firestore:', e);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId), 
        where('read', '==', false)
      );
      const snap = await getDocs(q);
      const promises = snap.docs.map(d => updateDoc(d.ref, { read: true }));
      await Promise.all(promises);
    } catch (e) {
      console.warn('Could not mark all as read:', e);
    }
  },

  subscribeToNotifications(userId: string, callback: (notifications: AppNotification[]) => void) {
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as AppNotification));
      callback(notifs.length > 0 ? notifs : INITIAL_DEMO_NOTIFICATIONS);
    }, (err) => {
      console.warn('Notification snapshot fallback:', err);
      callback(INITIAL_DEMO_NOTIFICATIONS);
    });
  }
};
