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

const getInitialDemoNotifications = (_userId: string): AppNotification[] => [];

export function sortNotificationsNewestFirst(notifs: AppNotification[]): AppNotification[] {
  return [...notifs].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
}

function getLocalNotifications(userId: string): AppNotification[] {
  try {
    const key = `tschuess_notifs_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return sortNotificationsNewestFirst(JSON.parse(raw));
    }
    const initial = sortNotificationsNewestFirst(getInitialDemoNotifications(userId));
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  } catch (e) {
    return sortNotificationsNewestFirst(getInitialDemoNotifications(userId));
  }
}

function saveLocalNotifications(userId: string, notifs: AppNotification[]) {
  try {
    const key = `tschuess_notifs_${userId}`;
    const sorted = sortNotificationsNewestFirst(notifs);
    localStorage.setItem(key, JSON.stringify(sorted));
    window.dispatchEvent(new CustomEvent('tschuess_notifications_changed', { detail: { userId } }));
  } catch (e) {
    console.warn('Could not save notifications locally:', e);
  }
}

export const notificationService = {
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const local = getLocalNotifications(userId);
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firestoreNotifs = snap.docs.map(d => ({ ...d.data(), id: d.id } as AppNotification));
        const sorted = sortNotificationsNewestFirst(firestoreNotifs);
        saveLocalNotifications(userId, sorted);
        return sorted;
      }
      return local;
    } catch (e) {
      return local;
    }
  },

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: AppNotification['type'],
    targetUrl?: string
  ): Promise<string> {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: AppNotification = {
      id,
      userId,
      title,
      message,
      type,
      targetUrl: targetUrl || '',
      read: false,
      createdAt: new Date().toISOString()
    };

    const current = getLocalNotifications(userId);
    saveLocalNotifications(userId, [newNotif, ...current]);

    try {
      await setDoc(doc(db, 'notifications', id), {
        ...newNotif,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Could not write notification to Firestore:', e);
    }
    return id;
  },

  async markAsRead(id: string, userId?: string): Promise<void> {
    // 1. Update in local storage
    if (userId) {
      const current = getLocalNotifications(userId);
      const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
      saveLocalNotifications(userId, updated);
    } else {
      // Find across all user keys in localStorage if userId not provided
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('tschuess_notifs_')) {
          try {
            const list: AppNotification[] = JSON.parse(localStorage.getItem(k) || '[]');
            if (list.some(n => n.id === id)) {
              const u = list.map(n => n.id === id ? { ...n, read: true } : n);
              localStorage.setItem(k, JSON.stringify(u));
              window.dispatchEvent(new CustomEvent('tschuess_notifications_changed', { detail: { id } }));
            }
          } catch {}
        }
      }
    }

    // 2. Update or merge in Firestore
    try {
      await setDoc(doc(db, 'notifications', id), {
        read: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Could not update notification in Firestore:', e);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    // 1. Update local storage immediately
    const current = getLocalNotifications(userId);
    const updated = current.map(n => ({ ...n, read: true }));
    saveLocalNotifications(userId, updated);

    // 2. Sync to Firestore in background
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId), 
        where('read', '==', false)
      );
      const snap = await getDocs(q);
      const promises = snap.docs.map(d => updateDoc(d.ref, { 
        read: true,
        updatedAt: serverTimestamp()
      }));
      await Promise.all(promises);
    } catch (e) {
      console.warn('Could not mark all as read in Firestore:', e);
    }
  },

  subscribeToNotifications(userId: string, callback: (notifications: AppNotification[]) => void) {
    // 1. Emit current local cache immediately
    const initial = getLocalNotifications(userId);
    callback(initial);

    // 2. Listen to internal custom and storage events for synchronous UI reactivity
    const handleLocalChange = () => {
      const updated = getLocalNotifications(userId);
      callback(updated);
    };

    window.addEventListener('tschuess_notifications_changed', handleLocalChange);
    window.addEventListener('storage', handleLocalChange);

    // 3. Connect Firestore real-time listener if available
    let unsubscribeFirestore = () => {};
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('userId', '==', userId)
      );

      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const notifs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as AppNotification));
          const sorted = sortNotificationsNewestFirst(notifs);
          saveLocalNotifications(userId, sorted);
          callback(sorted);
        }
      }, (err) => {
        console.warn('Notification snapshot warning:', err);
      });
    } catch (e) {
      console.warn('Could not attach Firestore listener:', e);
    }

    return () => {
      window.removeEventListener('tschuess_notifications_changed', handleLocalChange);
      window.removeEventListener('storage', handleLocalChange);
      unsubscribeFirestore();
    };
  }
};
