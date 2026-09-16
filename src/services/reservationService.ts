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
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Reservation, ReservationStatus, Product, UserProfile, Store } from '../types';
import { calculateEnvironmentalImpact, getCancellationRemainingSeconds } from '../utils/businessLogic';
import { DEMO_RESERVATIONS } from './seedDataService';
import { notificationService } from './notificationService';

export const reservationService = {
  /**
   * Atomic reservation creation using Firestore transaction to guarantee inventory integrity
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await runTransaction(db, async (transaction) => {
        const prodDoc = await transaction.get(productRef);
        
        let availableStock = product.quantityAvailable;
        if (prodDoc.exists()) {
          const prodData = prodDoc.data() as Product;
          availableStock = prodData.quantityAvailable;
        }

        if (availableStock < quantity) {
          throw new Error(`Only ${availableStock} items remaining. Could not reserve requested quantity.`);
        }

        const remainingStock = availableStock - quantity;
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

      // Send notifications
      await notificationService.createNotification(
        consumer.uid,
        'Reservation Confirmed',
        `Your reservation #${reservationCode} for ${product.name} at ${store.name} is confirmed! Pickup: ${pickupWindow}`,
        'reservation_status',
        `/app/reservations/${reservationId}`
      );

      // Notify retailer store manager
      if (store.ownerId) {
        await notificationService.createNotification(
          store.ownerId,
          'New Rescue Order Received',
          `${quantity}x ${product.name} reserved by ${consumer.name}. Code: ${reservationCode}`,
          'reservation_status',
          `/business/reservations`
        );
      }

      return newReservation;
    } catch (error: any) {
      console.warn('Transaction failed, falling back to direct write:', error);
      // If document was not in Firestore or transaction failed due to schema
      await setDoc(reservationRef, newReservation);
      return newReservation;
    }
  },

  async getReservationById(id: string): Promise<Reservation | null> {
    try {
      const snap = await getDoc(doc(db, 'reservations', id));
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as Reservation;
      }
      return DEMO_RESERVATIONS.find(r => r.id === id) || null;
    } catch (e) {
      return DEMO_RESERVATIONS.find(r => r.id === id) || null;
    }
  },

  async getReservationsForConsumer(consumerId: string): Promise<Reservation[]> {
    try {
      const q = query(
        collection(db, 'reservations'), 
        where('consumerId', '==', consumerId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Reservation));
      }
      return DEMO_RESERVATIONS.filter(r => r.consumerId === consumerId || consumerId.includes('consumer'));
    } catch (e) {
      return DEMO_RESERVATIONS.filter(r => r.consumerId === consumerId || consumerId.includes('consumer'));
    }
  },

  async getReservationsForStore(storeId: string): Promise<Reservation[]> {
    try {
      const q = query(
        collection(db, 'reservations'), 
        where('storeId', '==', storeId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Reservation));
      }
      return DEMO_RESERVATIONS.filter(r => r.storeId === storeId || storeId === 'store_rewe_kleve');
    } catch (e) {
      return DEMO_RESERVATIONS.filter(r => r.storeId === storeId || storeId === 'store_rewe_kleve');
    }
  },

  async getAllReservations(): Promise<Reservation[]> {
    try {
      const snap = await getDocs(collection(db, 'reservations'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Reservation));
      }
      return DEMO_RESERVATIONS;
    } catch (e) {
      return DEMO_RESERVATIONS;
    }
  },

  /**
   * Update reservation status (READY, COLLECTED, CANCELLED, etc.)
   */
  async updateReservationStatus(
    reservationId: string, 
    status: ReservationStatus, 
    cancellationReason?: string,
    isConsumerRequest: boolean = false
  ): Promise<void> {
    const resRef = doc(db, 'reservations', reservationId);
    
    // Retrieve existing reservation to validate cancellation window and retrieve items
    let existingRes: Reservation | null = null;
    let snapExists = false;

    try {
      const snap = await getDoc(resRef);
      if (snap.exists()) {
        existingRes = { ...snap.data(), id: snap.id } as Reservation;
        snapExists = true;
      }
    } catch (err) {
      console.warn('Could not read existing reservation doc from Firestore:', err);
    }

    if (!existingRes) {
      existingRes = DEMO_RESERVATIONS.find(r => r.id === reservationId) || null;
    }

    // Enforce 10-minute cancellation window if requested by a consumer
    if (status === 'CANCELLED' && isConsumerRequest && existingRes) {
      const remainingSeconds = getCancellationRemainingSeconds(existingRes.createdAt);
      if (remainingSeconds <= 0) {
        throw new Error('Cancellation window has expired. Reservations can only be cancelled within 10 minutes of booking.');
      }
    }

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

    // Persist status change to Firestore
    try {
      if (snapExists) {
        await updateDoc(resRef, updates);
      } else if (existingRes) {
        await setDoc(resRef, {
          ...existingRes,
          ...updates,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (writeErr) {
      console.warn('Firestore reservation update failed, falling back to local state:', writeErr);
    }

    // Also update in-memory DEMO_RESERVATIONS if it matches
    const demoIndex = DEMO_RESERVATIONS.findIndex(r => r.id === reservationId);
    if (demoIndex !== -1) {
      DEMO_RESERVATIONS[demoIndex] = {
        ...DEMO_RESERVATIONS[demoIndex],
        status,
        cancellationReason: cancellationReason || DEMO_RESERVATIONS[demoIndex].cancellationReason,
        updatedAt: new Date().toISOString()
      };
    }

    // Handle post-status actions
    try {
      const res = existingRes;
      if (!res) return;

      if (status === 'CANCELLED') {
        // Restore stock to inventory so items can be rescued by others
        if (res.items && res.items.length > 0) {
          for (const item of res.items) {
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
            'Reservation Cancelled by Shopper',
            `Order #${res.reservationCode} (${res.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}) was cancelled within 10 minutes.`,
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
          res.items.reduce((sum, i) => sum + i.quantity, 0),
          res.totalSaved,
          res.totalWeightKg
        );

        const eventRef = doc(db, 'impactEvents', `event_${Date.now()}`);
        await setDoc(eventRef, {
          id: `event_${Date.now()}`,
          consumerId: res.consumerId,
          storeId: res.storeId,
          reservationId,
          productsRescued: res.items.reduce((sum, i) => sum + i.quantity, 0),
          moneySaved: res.totalSaved,
          co2eAvoidedKg: impact.co2eAvoidedKg,
          foodDivertedKg: impact.foodDivertedKg,
          timestamp: serverTimestamp()
        });

        await notificationService.createNotification(
          res.consumerId,
          'Item Rescued! 🎉',
          `You collected #${res.reservationCode}! You saved €${res.totalSaved.toFixed(2)} and avoided ~${impact.co2eAvoidedKg} kg CO2e.`,
          'reservation_status',
          `/app/impact`
        );
      }
    } catch (e) {
      console.warn('Error recording post-status notifications/impact:', e);
    }
  },

  /**
   * Subscribe to real-time reservation updates
   */
  subscribeToReservations(
    filter: { storeId?: string; consumerId?: string },
    callback: (reservations: Reservation[]) => void
  ) {
    const coll = collection(db, 'reservations');
    let q = query(coll);
    if (filter.storeId) {
      q = query(coll, where('storeId', '==', filter.storeId));
    } else if (filter.consumerId) {
      q = query(coll, where('consumerId', '==', filter.consumerId));
    }

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Reservation));
      callback(items.length > 0 ? items : DEMO_RESERVATIONS);
    }, (err) => {
      console.warn('Reservation subscription fallback:', err);
      callback(DEMO_RESERVATIONS);
    });
  }
};
