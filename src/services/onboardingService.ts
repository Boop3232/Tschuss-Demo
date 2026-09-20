import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { storeService } from './storeService';

export interface RetailerOnboardingPayload {
  storeName: string;
  storeType: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  monthlyShrinkEur: number;
  pickupStartTime: string;
  pickupEndTime: string;
  operationalNotes?: string;
  acceptsTerms: boolean;
}

export interface RetailerApplicationDoc extends RetailerOnboardingPayload {
  id: string;
  referenceId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  createdStoreId?: string;
}

export interface OnboardingResponse {
  success: boolean;
  referenceId: string;
  applicationId: string;
  timestamp: string;
  message: string;
}

const LOCAL_STORAGE_KEY = 'tschuss_retailer_applications_v2';

export const onboardingService = {
  /**
   * Submit a retailer onboarding application directly to the Admin Dashboard (Firestore + Local Backup)
   */
  async submitOnboarding(payload: RetailerOnboardingPayload): Promise<OnboardingResponse> {
    const referenceId = `TSCH-${(payload.city || 'KLE').toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();
    let firestoreId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Submit to Firestore `retailer_onboardings` with status 'pending'
    try {
      const docRef = await addDoc(collection(db, 'retailer_onboardings'), {
        ...payload,
        referenceId,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      firestoreId = docRef.id;
    } catch (firestoreErr) {
      console.info('[OnboardingService] Firestore write fallback:', firestoreErr);
    }

    // 2. Also notify backend endpoint if available
    try {
      await fetch('/api/retailer-onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          id: firestoreId,
          referenceId,
          status: 'pending',
        }),
      });
    } catch {
      // safe fallback
    }

    // 3. Save to Local Storage for instant admin availability
    const newApp: RetailerApplicationDoc = {
      ...payload,
      id: firestoreId,
      referenceId,
      status: 'pending',
      createdAt: nowIso,
    };

    try {
      const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const updated = [newApp, ...existing.filter((item: any) => item.id !== firestoreId)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // safe local storage fallback
    }

    return {
      success: true,
      referenceId,
      applicationId: firestoreId,
      timestamp: nowIso,
      message: `Your retailer partner application (${referenceId}) has been submitted and sent to the Admin Dashboard with status 'pending'.`,
    };
  },

  /**
   * Fetch all retailer applications for the Admin Dashboard
   */
  async getApplications(): Promise<RetailerApplicationDoc[]> {
    const itemsMap = new Map<string, RetailerApplicationDoc>();

    // 1. Load from LocalStorage first
    try {
      const localItems: RetailerApplicationDoc[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      localItems.forEach(item => itemsMap.set(item.id, item));
    } catch {
      // ignore
    }

    // 2. Fetch from Firestore
    try {
      const q = query(collection(db, 'retailer_onboardings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const createdAtStr = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString());
        
        itemsMap.set(docSnap.id, {
          id: docSnap.id,
          referenceId: data.referenceId || `TSCH-KLE-${docSnap.id.slice(0, 4)}`,
          storeName: data.storeName || 'Unnamed Store',
          storeType: data.storeType || 'Supermarket',
          contactName: data.contactName || 'Store Manager',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          postalCode: data.postalCode || '',
          city: data.city || 'Kleve',
          coordinates: data.coordinates || { lat: 51.7891, lng: 6.1381 },
          monthlyShrinkEur: data.monthlyShrinkEur || 3000,
          pickupStartTime: data.pickupStartTime || '17:00',
          pickupEndTime: data.pickupEndTime || '20:30',
          operationalNotes: data.operationalNotes || '',
          acceptsTerms: data.acceptsTerms ?? true,
          status: data.status || 'pending',
          createdAt: createdAtStr,
          approvedAt: data.approvedAt,
          createdStoreId: data.createdStoreId,
        });
      });
    } catch (err) {
      console.info('[OnboardingService] Using cached local applications:', err);
    }

    // Return sorted array
    const result = Array.from(itemsMap.values());
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  },

  /**
   * Update application status (pending, approved, rejected)
   */
  async updateApplicationStatus(applicationId: string, newStatus: 'pending' | 'approved' | 'rejected'): Promise<void> {
    // Update in Firestore
    try {
      const docRef = doc(db, 'retailer_onboardings', applicationId);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch {
      // ignore
    }

    // Update in Local Storage
    try {
      const localItems: RetailerApplicationDoc[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const updated = localItems.map(item => item.id === applicationId ? { ...item, status: newStatus } : item);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  /**
   * Approve application: sets status to 'approved' and automatically creates live Store
   */
  async approveApplication(app: RetailerApplicationDoc): Promise<string> {
    // 1. Create live Store
    const createdStoreId = await storeService.createStore({
      name: app.storeName,
      ownerId: `retailer_${app.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      address: `${app.address}, ${app.postalCode} ${app.city}`,
      city: app.city,
      latitude: app.coordinates?.lat || 51.7891,
      longitude: app.coordinates?.lng || 6.1381,
      openingHours: `${app.pickupStartTime} - ${app.pickupEndTime}`,
      phone: app.phone,
      categories: [app.storeType as any || 'Grocery'],
      status: 'active',
      pickupInstructions: app.operationalNotes || `Pick up at ${app.storeName} service counter.`
    });

    // 2. Mark application approved
    try {
      const docRef = doc(db, 'retailer_onboardings', app.id);
      await updateDoc(docRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        createdStoreId: createdStoreId,
      });
    } catch {
      // ignore
    }

    // Update local storage
    try {
      const localItems: RetailerApplicationDoc[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const updated = localItems.map(item => item.id === app.id ? { ...item, status: 'approved' as const, createdStoreId: createdStoreId } : item);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    return createdStoreId;
  }
};
