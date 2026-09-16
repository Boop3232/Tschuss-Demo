import { collection, getDocs, doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Store, Product, Reservation } from '../types';

export const DEMO_STORES: Store[] = [
  {
    id: 'store_rewe_kleve',
    name: 'REWE Kleve (Demo Partner)',
    ownerId: 'retailer_rewe_kleve',
    address: 'Große Straße 45',
    city: 'Kleve',
    latitude: 51.7885,
    longitude: 6.1362,
    openingHours: 'Mon-Sat 07:00 - 21:30',
    phone: '+49 2821 97810',
    categories: ['Grocery', 'Bakery', 'Drinks'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    description: 'Fresh regional produce and daily supermarket goods.',
    pickupInstructions: 'Head to the dedicated Tschüss Pick-up Station near Customer Service.'
  },
  {
    id: 'store_edeka_kleve',
    name: 'EDEKA Center Kleve (Demo Partner)',
    ownerId: 'retailer_edeka_kleve',
    address: 'Ludwig-Jahn-Straße 12',
    city: 'Kleve',
    latitude: 51.7924,
    longitude: 6.1458,
    openingHours: 'Mon-Sat 08:00 - 21:00',
    phone: '+49 2821 72150',
    categories: ['Grocery', 'Drinks', 'Household'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    description: 'Extensive fresh food counters, dairy and produce.',
    pickupInstructions: 'Pick up directly at checkout #1 (express rescue counter).'
  },
  {
    id: 'store_baeckerei_kleve',
    name: 'Bäckerei & Konditorei Kleve (Demo Partner)',
    ownerId: 'retailer_bakery_kleve',
    address: 'Kavarinerstraße 28',
    city: 'Kleve',
    latitude: 51.7869,
    longitude: 6.1340,
    openingHours: 'Mon-Sun 06:30 - 18:00',
    phone: '+49 2821 23411',
    categories: ['Bakery'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional artisan loaves, croissants, and sourdough bread.',
    pickupInstructions: 'Show your Tschüss app code to the counter staff.'
  },
  {
    id: 'store_biomarkt_kleve',
    name: 'BioMarkt Kleve (Demo Partner)',
    ownerId: 'retailer_biomarkt_kleve',
    address: 'Hagsche Straße 82',
    city: 'Kleve',
    latitude: 51.7852,
    longitude: 6.1395,
    openingHours: 'Mon-Fri 08:30 - 19:00, Sat 08:30 - 16:00',
    phone: '+49 2821 45290',
    categories: ['Grocery', 'Cosmetics', 'Drinks'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80',
    description: 'Certified organic dairy, plant-based milks, and natural beauty products.',
    pickupInstructions: 'Proceed to the information desk inside the entrance.'
  },
  {
    id: 'store_blumen_kleve',
    name: 'Blumen & Floristik Kleve (Demo Partner)',
    ownerId: 'retailer_blumen_kleve',
    address: 'Opschlag 14',
    city: 'Kleve',
    latitude: 51.7899,
    longitude: 6.1325,
    openingHours: 'Mon-Sat 08:30 - 18:30',
    phone: '+49 2821 34912',
    categories: ['Flowers'],
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    description: 'Fresh seasonal flowers and potted plants rescued before wilting.',
    pickupInstructions: 'Present code at the main florist workstation.'
  }
];

// Helper to generate dynamic dates relative to current time
const getFutureDate = (hoursFromNow: number) => {
  const date = new Date(Date.now() + hoursFromNow * 3600 * 1000);
  return date.toISOString();
};

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'prod_creamy_yoghurt',
    storeId: 'store_rewe_kleve',
    storeName: 'REWE Kleve (Demo Partner)',
    storeAddress: 'Große Straße 45, Kleve',
    storeCity: 'Kleve',
    storeLat: 51.7885,
    storeLng: 6.1362,
    name: 'Creamy Greek Style Yoghurt 500g',
    description: 'Full-bodied organic yoghurt with authentic mild culture. Perfectly fresh and chilled.',
    category: 'Grocery',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    originalPrice: 2.50,
    discountPercent: 70,
    rescuePrice: 0.75,
    quantityAvailable: 5,
    unit: '500g tub',
    expiryAt: getFutureDate(26), // Tomorrow
    pickupStartTime: '08:00',
    pickupEndTime: '21:00',
    status: 'active',
    estimatedWeightKg: 0.5
  },
  {
    id: 'prod_wholegrain_bread',
    storeId: 'store_baeckerei_kleve',
    storeName: 'Bäckerei & Konditorei Kleve (Demo Partner)',
    storeAddress: 'Kavarinerstraße 28, Kleve',
    storeCity: 'Kleve',
    storeLat: 51.7869,
    storeLng: 6.1340,
    name: 'Artisan Wholegrain Sourdough Loaf',
    description: 'Stone-oven baked sourdough with sunflower and pumpkin seeds. Baked this morning.',
    category: 'Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    originalPrice: 3.80,
    discountPercent: 65,
    rescuePrice: 1.33,
    quantityAvailable: 8,
    unit: '750g loaf',
    expiryAt: getFutureDate(18), // Tomorrow morning
    pickupStartTime: '14:00',
    pickupEndTime: '18:00',
    status: 'active',
    estimatedWeightKg: 0.75
  },
  {
    id: 'prod_tulip_bouquet',
    storeId: 'store_blumen_kleve',
    storeName: 'Blumen & Floristik Kleve (Demo Partner)',
    storeAddress: 'Opschlag 14, Kleve',
    storeCity: 'Kleve',
    storeLat: 51.7899,
    storeLng: 6.1325,
    name: 'Fresh Tulip Bouquet (15 stems)',
    description: 'Vibrant spring tulips in bloom. Still fresh for 4-5 days of vase life at home.',
    category: 'Flowers',
    imageUrl: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=80',
    originalPrice: 12.00,
    discountPercent: 70,
    rescuePrice: 3.60,
    quantityAvailable: 4,
    unit: 'bunch',
    expiryAt: getFutureDate(14), // Today evening
    pickupStartTime: '10:00',
    pickupEndTime: '18:30',
    status: 'active',
    estimatedWeightKg: 0.4
  },
  {
    id: 'prod_bio_oat_milk',
    storeId: 'store_biomarkt_kleve',
    storeName: 'BioMarkt Kleve (Demo Partner)',
    storeAddress: 'Hagsche Straße 82, Kleve',
    storeCity: 'Kleve',
    storeLat: 51.7852,
    storeLng: 6.1395,
    name: 'Organic Barista Oat Drink (1L)',
    description: 'Creamy plant-based oat beverage ideal for specialty coffee foam and breakfast cereal.',
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    originalPrice: 2.29,
    discountPercent: 55,
    rescuePrice: 1.03,
    quantityAvailable: 12,
    unit: '1L carton',
    expiryAt: getFutureDate(48), // in 2 days
    pickupStartTime: '09:00',
    pickupEndTime: '19:00',
    status: 'active',
    estimatedWeightKg: 1.0
  },
  {
    id: 'prod_face_cream',
    storeId: 'store_biomarkt_kleve',
    storeName: 'BioMarkt Kleve (Demo Partner)',
    storeAddress: 'Hagsche Straße 82, Kleve',
    storeCity: 'Kleve',
    storeLat: 51.7852,
    storeLng: 6.1395,
    name: 'Soothing Chamomile Night Cream 50ml',
    description: 'Gentle certified natural cosmetic formula. Near best-before date but sealed and pristine.',
    category: 'Cosmetics',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    originalPrice: 9.50,
    discountPercent: 60,
    rescuePrice: 3.80,
    quantityAvailable: 3,
    unit: '50ml jar',
    expiryAt: getFutureDate(72), // in 3 days
    pickupStartTime: '09:00',
    pickupEndTime: '19:00',
    status: 'active',
    estimatedWeightKg: 0.15
  },
  {
    id: 'prod_crisp_apples',
    storeId: 'store_edeka_kleve',
    storeName: 'EDEKA Center Kleve (Demo Partner)',
    storeAddress: 'Ludwig-Jahn-Straße 12, Kleve',
    storeCity: 'Kleve',
    storeLat: 51.7924,
    storeLng: 6.1458,
    name: 'Regional Elstar Apples (1.5 kg bag)',
    description: 'Crisp and juicy sweet-tart apples from local Lower Rhine orchards.',
    category: 'Grocery',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    originalPrice: 3.49,
    discountPercent: 70,
    rescuePrice: 1.05,
    quantityAvailable: 7,
    unit: '1.5 kg bag',
    expiryAt: getFutureDate(30), // tomorrow
    pickupStartTime: '08:00',
    pickupEndTime: '20:30',
    status: 'active',
    estimatedWeightKg: 1.5
  },
  {
    id: 'prod_french_croissants',
    storeId: 'store_baeckerei_kleve',
    storeName: 'Bäckerei & Konditorei Kleve (Demo Partner)',
    storeAddress: 'Kavarinerstraße 28, Kleve',
    storeCity: 'Kleve',
    storeLat: 51.7869,
    storeLng: 6.1340,
    name: 'Butter Croissants 4-Pack',
    description: 'Flaky pure butter croissants freshly baked. Delicious warmed up or with jam.',
    category: 'Bakery',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    originalPrice: 4.20,
    discountPercent: 70,
    rescuePrice: 1.26,
    quantityAvailable: 6,
    unit: '4 pack',
    expiryAt: getFutureDate(12), // Today
    pickupStartTime: '15:00',
    pickupEndTime: '18:00',
    status: 'active',
    estimatedWeightKg: 0.35
  },
  {
    id: 'prod_organic_orange_juice',
    storeId: 'store_rewe_kleve',
    storeName: 'REWE Kleve (Demo Partner)',
    storeAddress: 'Große Straße 45, Kleve',
    storeCity: 'Kleve',
    storeLat: 51.7885,
    storeLng: 6.1362,
    name: 'Direct Squeezed Bio Orange Juice 1L',
    description: 'Fresh non-concentrated organic orange juice with pulp. High vitamin C.',
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    originalPrice: 2.89,
    discountPercent: 60,
    rescuePrice: 1.16,
    quantityAvailable: 9,
    unit: '1L glass bottle',
    expiryAt: getFutureDate(38), // tomorrow
    pickupStartTime: '08:00',
    pickupEndTime: '21:00',
    status: 'active',
    estimatedWeightKg: 1.1
  }
];

export const DEMO_RESERVATIONS: Reservation[] = [
  {
    id: 'res_demo_001',
    reservationCode: 'TS-4829',
    consumerId: 'demo_consumer_123',
    consumerName: 'Hannah Becker',
    consumerEmail: 'hannah.consumer@tschuess.de',
    consumerPhone: '+49 2821 789012',
    storeId: 'store_rewe_kleve',
    storeName: 'REWE Kleve (Demo Partner)',
    storeAddress: 'Große Straße 45, Kleve',
    storePhone: '+49 2821 97810',
    storeLat: 51.7885,
    storeLng: 6.1362,
    items: [
      {
        productId: 'prod_creamy_yoghurt',
        name: 'Creamy Greek Style Yoghurt 500g',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
        originalPrice: 2.50,
        rescuePrice: 0.75,
        quantity: 2,
        total: 1.50,
        category: 'Grocery',
        estimatedWeightKg: 0.5
      }
    ],
    totalAmount: 1.50,
    totalSaved: 3.50,
    totalWeightKg: 1.0,
    pickupWindow: 'Today 17:00 - 20:30',
    pickupDeadline: 'Today 20:30',
    status: 'READY',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'res_demo_002',
    reservationCode: 'TS-3914',
    consumerId: 'demo_consumer_123',
    consumerName: 'Hannah Becker',
    consumerEmail: 'hannah.consumer@tschuess.de',
    consumerPhone: '+49 2821 789012',
    storeId: 'store_baeckerei_kleve',
    storeName: 'Bäckerei & Konditorei Kleve (Demo Partner)',
    storeAddress: 'Kavarinerstraße 28, Kleve',
    storePhone: '+49 2821 23411',
    storeLat: 51.7869,
    storeLng: 6.1340,
    items: [
      {
        productId: 'prod_wholegrain_bread',
        name: 'Artisan Wholegrain Sourdough Loaf',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        originalPrice: 3.80,
        rescuePrice: 1.33,
        quantity: 1,
        total: 1.33,
        category: 'Bakery',
        estimatedWeightKg: 0.75
      }
    ],
    totalAmount: 1.33,
    totalSaved: 2.47,
    totalWeightKg: 0.75,
    pickupWindow: 'Yesterday 16:00 - 18:00',
    pickupDeadline: 'Yesterday 18:00',
    status: 'COLLECTED',
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    collectedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'res_demo_003',
    reservationCode: 'TS-7721',
    consumerId: 'demo_consumer_123',
    consumerName: 'Hannah Becker',
    consumerEmail: 'hannah.consumer@tschuess.de',
    consumerPhone: '+49 2821 789012',
    storeId: 'store_biomarkt_kleve',
    storeName: 'BioMarkt Kleve Organics (Demo Partner)',
    storeAddress: 'Hagsche Straße 12, Kleve',
    storePhone: '+49 2821 56712',
    storeLat: 51.7891,
    storeLng: 6.1385,
    items: [
      {
        productId: 'prod_avocado_bag',
        name: 'Ready-to-Eat Hass Avocados (Pack of 3)',
        imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80',
        originalPrice: 3.49,
        rescuePrice: 1.20,
        quantity: 1,
        total: 1.20,
        category: 'Grocery',
        estimatedWeightKg: 0.6
      }
    ],
    totalAmount: 1.20,
    totalSaved: 2.29,
    totalWeightKg: 0.6,
    pickupWindow: 'Today 18:00 - 21:00',
    pickupDeadline: 'Today 21:00',
    status: 'CONFIRMED',
    // Created 3 minutes ago -> ~7 minutes left of 10-minute cancellation window
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  }
];

/**
 * Seeds the Firestore database with initial realistic demo stores, products, and sample reservations.
 */
export async function seedDemoDataIfEmpty(): Promise<{ seeded: boolean; message: string }> {
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (!productsSnap.empty) {
      return { seeded: false, message: 'Database already contains products.' };
    }

    // Seed Stores
    for (const store of DEMO_STORES) {
      await setDoc(doc(db, 'stores', store.id), {
        ...store,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // Seed Products
    for (const product of DEMO_PRODUCTS) {
      await setDoc(doc(db, 'products', product.id), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // Seed Reservations
    for (const res of DEMO_RESERVATIONS) {
      await setDoc(doc(db, 'reservations', res.id), {
        ...res,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // Seed Demo Retailer User Document
    await setDoc(doc(db, 'users', 'retailer_rewe_kleve'), {
      uid: 'retailer_rewe_kleve',
      name: 'Markus Weber',
      email: 'markus.weber@rewe-kleve.de',
      role: 'retailer',
      phone: '+49 2821 97810',
      language: 'de',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { seeded: true, message: 'Successfully seeded Kleve demo stores and rescue products!' };
  } catch (error) {
    console.warn('Initial Firestore seeding skipped or pending connection:', error);
    return { seeded: false, message: error instanceof Error ? error.message : 'Seeding skipped' };
  }
}

/**
 * Forces re-seeding of all demo stores, products and reservations.
 */
export async function forceReSeedDemoData(): Promise<{ seeded: boolean; message: string }> {
  try {
    for (const store of DEMO_STORES) {
      await setDoc(doc(db, 'stores', store.id), {
        ...store,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    for (const product of DEMO_PRODUCTS) {
      await setDoc(doc(db, 'products', product.id), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    for (const res of DEMO_RESERVATIONS) {
      await setDoc(doc(db, 'reservations', res.id), {
        ...res,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    return { seeded: true, message: 'Successfully force-reseeded Kleve demo data!' };
  } catch (error) {
    console.error('Error force re-seeding:', error);
    return { seeded: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}
