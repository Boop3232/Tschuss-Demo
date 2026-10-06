import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot, 
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Reservation, ReservationStatus, Product, UserProfile, Store } from '../types';
import { calculateEnvironmentalImpact, getCancellationRemainingSeconds } from '../utils/businessLogic';
import { DEMO_RESERVATIONS } from './seedDataService';
import { notificationService } from './notificationService';

const STORAGE_KEY = 'tschuess_reservations_v1';

/**
 * Retrieve persistent reservations from localStorage, falling back to seed demo data.
 */
function getLocalReservations(): Reservation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read reservations from localStorage:', err);
  }

  // Initialize with DEMO_RESERVATIONS if localStorage was empty
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_RESERVATIONS));
  } catch (err) {}

  return [...DEMO_RESERVATIONS];
}

/**
 * Save reservations to localStorage and notify all listeners across pages and tabs.
 */
function saveLocalReservations(reservations: Reservation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  } catch (err) {
    console.warn('Failed to save reservations to localStorage:', err);
  }

  // Update in-memory DEMO_RESERVATIONS for backwards-compatibility
  for (const res of reservations) {
    const idx = DEMO_RESERVATIONS.findIndex(r => r.id === res.id);
    if (idx !== -1) {
      DEMO_RESERVATIONS[idx] = { ...DEMO_RESERVATIONS[idx], ...res };
    } else {
      DEMO_RESERVATIONS.unshift(res);
    }
  }

  // Broadcast event for immediate real-time sync across any open React components
  try {
    window.dispatchEvent(new CustomEvent('tschuess_reservations_changed', { detail: { reservations } }));
  } catch (err) {}
}

/**
 * Merge remote Firestore reservation documents with local cache.
 */
function mergeReservations(remoteList: Reservation[], localList: Reservation[]): Reservation[] {
  const map = new Map<string, Reservation>();

  // Start with local items (which might have recent client-side status updates)
  for (const item of localList) {
    map.set(item.id, item);
  }

  // Merge remote items
  for (const remote of remoteList) {
    const existing = map.get(remote.id);
    if (!existing) {
      map.set(remote.id, remote);
    } else {
      // Keep whichever has newer or equivalent status
      const remoteTime = new Date(remote.updatedAt || remote.createdAt).getTime();
      const localTime = new Date(existing.updatedAt || existing.createdAt).getTime();
      if (remoteTime > localTime) {
        map.set(remote.id, remote);
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const reservationService = {
  /**
   * Create a reservation. Saves immediately to local storage, syncs to Firestore,
   * updates inventory, and notifies both consumer and store.
   */
  async createReservation(
    consumer: UserProfile,
    store: Store,
    product: Product,
    quantity: number,
    pickupWindow: string,
    pickupDeadline: string
  ): Promise<Reservation> {
    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const randomCodeDigits = Math.floor(1000 + Math.random() * 9000);
    const reservationCode = `TS-${randomCodeDigits}`;

    const productRef = doc(db, 'products', product.id);
    const reservationRef = doc(db, 'reservations', reservationId);

    const unitPrice = product.rescuePrice;
    const totalAmount = Math.round(unitPrice * quantity * 100) / 100;
    const totalSaved = Math.round((product.originalPrice - unitPrice) * quantity * 100) / 100;
    const totalWeightKg = (product.estimatedWeightKg || 0.5) * quantity;
    const nowIso = new Date().toISOString();

    const newReservation: Reservation = {
      id: reservationId,
      reservationCode,
      consumerId: consumer.uid,
      consumerName: consumer.name,
      consumerEmail: consumer.email,
      consumerPhone: consumer.phone || '',
      storeId: store.id,
      storeName: store.name,
      storeAddress: store.address,
      storePhone: store.phone,
      storeLat: store.latitude,
      storeLng: store.longitude,
      items: [
        {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          originalPrice: product.originalPrice,
          rescuePrice: product.rescuePrice,
          quantity,
          total: totalAmount,
          category: product.category,
          estimatedWeightKg: product.estimatedWeightKg
        }
      ],
      totalAmount,
      totalSaved,
      totalWeightKg,
      pickupWindow,
      pickupDeadline,
      status: 'CONFIRMED',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // 1. Immediately persist to localStorage so it is NEVER lost on reload or navigation
    const currentLocal = getLocalReservations();
    const updatedLocal = [newReservation, ...currentLocal.filter(r => r.id !== reservationId)];
    saveLocalReservations(updatedLocal);

    // 2. Persist to Firestore database
    try {
      await runTransaction(db, async (transaction) => {
        const prodDoc = await transaction.get(productRef);
        
        let availableStock = product.quantityAvailable;
        if (prodDoc.exists()) {
          const prodData = prodDoc.data() as Product;
          availableStock = prodData.quantityAvailable;
        }

        const remainingStock = Math.max(0, availableStock - quantity);
        const newStatus = remainingStock <= 0 ? 'sold_out' : 'active';

        // Update product inventory atomically
        transaction.update(productRef, {
          quantityAvailable: remainingStock,
          status: newStatus,
          updatedAt: serverTimestamp()
        });

        // Create reservation document
        transaction.set(reservationRef, {
          ...newReservation,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
    } catch (txError) {
      console.warn('Firestore transaction fallback to direct setDoc:', txError);
      try {
        await setDoc(reservationRef, newReservation);
        await updateDoc(productRef, {
          quantityAvailable: Math.max(0, product.quantityAvailable - quantity),
          updatedAt: serverTimestamp()
        });
      } catch (directWriteErr) {
        console.warn('Firestore direct write failed, saved in persistent local store:', directWriteErr);
      }
    }

    // 3. Send notifications
    try {
      await notificationService.createNotification(
        consumer.uid,
        'Reservation Confirmed',
        `Your reservation #${reservationCode} for ${product.name} at ${store.name} is confirmed! Pickup: ${pickupWindow}`,
        'reservation_status',
        `/app/reservations/${reservationId}`
      );

      if (store.ownerId) {
        await notificationService.createNotification(
          store.ownerId,
          'New Rescue Order Received',
          `${quantity}x ${product.name} reserved by ${consumer.name}. Code: ${reservationCode}`,
          'reservation_status',
          `/business/reservations`
        );
      }
    } catch (notifErr) {
      console.warn('Notification delivery skipped:', notifErr);
    }

    return newReservation;
  },

  /**
   * Get a single reservation by ID
   */
  async getReservationById(id: string): Promise<Reservation | null> {
    const localList = getLocalReservations();
    const localMatch = localList.find(r => r.id === id || r.reservationCode === id);

    try {
      const snap = await getDoc(doc(db, 'reservations', id));
      if (snap.exists()) {
        const remoteData = { ...snap.data(), id: snap.id } as Reservation;
        // Merge with local list if newer
        const merged = mergeReservations([remoteData], localList);
        saveLocalReservations(merged);
        return remoteData;
      }
    } catch (e) {
      console.warn('Could not read reservation from Firestore, using local cache:', e);
    }

    return localMatch || null;
  },

  /**
   * Get reservations for a consumer
   */
  async getReservationsForConsumer(consumerId: string): Promise<Reservation[]> {
    const localList = getLocalReservations();

    try {
      const q = query(
        collection(db, 'reservations'), 
        where('consumerId', '==', consumerId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const remoteItems = snap.docs.map(d => ({ ...d.data(), id: d.id } as Reservation));
        const merged = mergeReservations(remoteItems, localList);
        saveLocalReservations(merged);
      }
    } catch (e) {
      console.warn('Firestore consumer reservations query failed, falling back to local storage:', e);
    }

    const currentList = getLocalReservations();
    return currentList.filter(r => 
      r.consumerId === consumerId || 
      consumerId.includes('consumer') || 
      consumerId.includes('demo') || 
      consumerId.includes('guest') ||
      r.consumerEmail?.includes('consumer')
    );
  },

  /**
   * Get reservations for a store. If storeId is 'all' or empty, returns all reservations.
   */
  async getReservationsForStore(storeId: string): Promise<Reservation[]> {
    const localList = getLocalReservations();

    try {
      let q = query(collection(db, 'reservations'));
      if (storeId && storeId !== 'all') {
        q = query(collection(db, 'reservations'), where('storeId', '==', storeId));
      }
      const snap = await getDocs(q);
      if (!snap.empty) {
        const remoteItems = snap.docs.map(d => ({ ...d.data(), id: d.id } as Reservation));
        const merged = mergeReservations(remoteItems, localList);
        saveLocalReservations(merged);
      }
    } catch (e) {
      console.warn('Firestore store reservations query failed, using persistent local storage:', e);
    }

    const currentList = getLocalReservations();
    if (!storeId || storeId === 'all') {
      return currentList;
    }
    return currentList.filter(r => r.storeId === storeId);
  },

  /**
   * Get all reservations across all stores and consumers.
   */
  async getAllReservations(): Promise<Reservation[]> {
    const localList = getLocalReservations();
    try {
      const snap = await getDocs(collection(db, 'reservations'));
      if (!snap.empty) {
        const remoteItems = snap.docs.map(d => ({ ...d.data(), id: d.id } as Reservation));
        const merged = mergeReservations(remoteItems, localList);
        saveLocalReservations(merged);
        return merged;
      }
    } catch (e) {
      console.warn('getAllReservations fallback to local cache:', e);
    }
    return localList;
  },

  /**
   * Update reservation status (CONFIRMED -> READY -> COLLECTED / CANCELLED).
   * Persists immediately to localStorage (preventing status reset on reload),
   * syncs with Firestore, restores stock on cancellation, and records impact on collection.
   */
  async updateReservationStatus(
    reservationId: string, 
    status: ReservationStatus, 
    cancellationReason?: string,
    isConsumerRequest: boolean = false
  ): Promise<void> {
    const nowIso = new Date().toISOString();
    const localList = getLocalReservations();
    const targetIdx = localList.findIndex(r => r.id === reservationId || r.reservationCode === reservationId);

    let existingRes: Reservation | null = targetIdx !== -1 ? localList[targetIdx] : null;

    // Validate 10-minute cancellation window for consumer requests
    if (status === 'CANCELLED' && isConsumerRequest && existingRes) {
      const remainingSeconds = getCancellationRemainingSeconds(existingRes.createdAt);
      if (remainingSeconds <= 0) {
        throw new Error('Cancellation window has expired. Reservations can only be cancelled within 10 minutes of booking.');
      }
    }

    // 1. Immediately update local storage so page reload PRESERVES the status
    if (targetIdx !== -1 && existingRes) {
      const updatedItem: Reservation = {
        ...existingRes,
        status,
        updatedAt: nowIso,
        ...(status === 'COLLECTED' || status === 'COMPLETED' ? { collectedAt: nowIso } : {}),
        ...(cancellationReason ? { cancellationReason } : {})
      };
      localList[targetIdx] = updatedItem;
      saveLocalReservations([...localList]);
      existingRes = updatedItem;
    }

    // 2. Persist status update to Firestore
    const resRef = doc(db, 'reservations', reservationId);
    const updates: any = {
      status,
      updatedAt: serverTimestamp()
    };
    if (cancellationReason) {
      updates.cancellationReason = cancellationReason;
    }
    if (status === 'COLLECTED' || status === 'COMPLETED') {
      updates.collectedAt = serverTimestamp();
    }

    try {
      const snap = await getDoc(resRef);
      if (snap.exists()) {
        await updateDoc(resRef, updates);
      } else if (existingRes) {
        await setDoc(resRef, {
          ...existingRes,
          ...updates,
          updatedAt: serverTimestamp()
        });
      }
    } catch (writeErr) {
      console.warn('Firestore reservation status sync failed, update preserved in localStorage:', writeErr);
    }

    // 3. Post-status actions (restoring stock, recording environmental impact, sending notifications)
    try {
      const res = existingRes;
      if (!res) return;
      const reservationItems = Array.isArray(res.items)
        ? res.items.filter(item => item && typeof item === 'object')
        : [];

      if (status === 'CANCELLED') {
        // Restore stock to inventory so items can be rescued by others
        if (reservationItems.length > 0) {
          for (const item of reservationItems) {
            if (item.productId) {
              try {
                const prodRef = doc(db, 'products', item.productId);
                const prodSnap = await getDoc(prodRef);
                if (prodSnap.exists()) {
                  const prodData = prodSnap.data() as Product;
                  const restoredQty = (prodData.quantityAvailable || 0) + (item.quantity || 1);
                  await updateDoc(prodRef, {
                    quantityAvailable: restoredQty,
                    status: 'active',
                    updatedAt: serverTimestamp()
                  });
                }
              } catch (stockErr) {
                console.warn('Could not restore inventory for item:', item.productId, stockErr);
              }
            }
          }
        }

        // Notify consumer
        await notificationService.createNotification(
          res.consumerId,
          'Reservation Cancelled',
          `Your reservation #${res.reservationCode} was cancelled. Reserved items have been released back to the store.`,
          'reservation_status',
          `/app/reservations/${reservationId}`
        );

        // Notify store manager
        if (res.storeId) {
          await notificationService.createNotification(
            res.storeId,
            'Reservation Cancelled',
            `Order #${res.reservationCode || res.id} (${reservationItems.map(i => `${Number(i.quantity) || 0}x ${i.name || 'item'}`).join(', ')}) was cancelled.`,
            'reservation_status',
            `/business/reservations`
          );
        }
      } else if (status === 'READY') {
        await notificationService.createNotification(
          res.consumerId,
          'Order Ready for Pickup',
          `Your reservation #${res.reservationCode} at ${res.storeName} is packed and ready for pickup!`,
          'reservation_status',
          `/app/reservations/${reservationId}`
        );
      } else if (status === 'COLLECTED') {
        // Record environmental impact event
        const impact = calculateEnvironmentalImpact(
          reservationItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0),
          Number(res.totalSaved) || 0,
          Number(res.totalWeightKg) || 0
        );

        try {
          const eventRef = doc(db, 'impactEvents', `event_${Date.now()}`);
          await setDoc(eventRef, {
            id: `event_${Date.now()}`,
            consumerId: res.consumerId,
            storeId: res.storeId,
            reservationId,
            productsRescued: reservationItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0),
            moneySaved: Number(res.totalSaved) || 0,
            co2eAvoidedKg: impact.co2eAvoidedKg,
            foodDivertedKg: impact.foodDivertedKg,
            timestamp: serverTimestamp()
          });
        } catch (impactErr) {
          console.warn('Could not record impact event to Firestore:', impactErr);
        }

        await notificationService.createNotification(
          res.consumerId,
          'Item Rescued! 🎉',
          `You collected #${res.reservationCode || res.id}! You saved €${(Number(res.totalSaved) || 0).toFixed(2)} and avoided ~${impact.co2eAvoidedKg} kg CO2e.`,
          'reservation_status',
          `/app/impact`
        );
      }
    } catch (postStatusErr) {
      console.warn('Error during post-status processing:', postStatusErr);
    }
  },

  /**
   * Subscribe to real-time reservation updates.
   * Listens to Firestore onSnapshot AND custom window events for full synchronization.
   */
  subscribeToReservations(
    filter: { storeId?: string; consumerId?: string },
    callback: (reservations: Reservation[]) => void
  ): () => void {
    // Immediate callback with current persistent local store
    const deliverLocal = () => {
      let items = getLocalReservations();
      if (filter.storeId && filter.storeId !== 'all') {
        items = items.filter(r => r.storeId === filter.storeId);
      } else if (filter.consumerId) {
        items = items.filter(r => r.consumerId === filter.consumerId || filter.consumerId?.includes('consumer'));
      }
      callback(items);
    };

    deliverLocal();

    // Listen for local changes
    const localHandler = () => {
      deliverLocal();
    };
    window.addEventListener('tschuess_reservations_changed', localHandler);
    window.addEventListener('storage', localHandler);

    // Firestore onSnapshot listener
    const coll = collection(db, 'reservations');
    let q = query(coll);
    if (filter.storeId && filter.storeId !== 'all') {
      q = query(coll, where('storeId', '==', filter.storeId));
    } else if (filter.consumerId) {
      q = query(coll, where('consumerId', '==', filter.consumerId));
    }

    const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const remoteItems = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Reservation));
        const merged = mergeReservations(remoteItems, getLocalReservations());
        saveLocalReservations(merged);
        deliverLocal();
      }
    }, (err) => {
      console.warn('Firestore reservation onSnapshot fallback to local store:', err);
      deliverLocal();
    });

    return () => {
      window.removeEventListener('tschuess_reservations_changed', localHandler);
      window.removeEventListener('storage', localHandler);
      unsubscribeFirestore();
    };
  }
};
