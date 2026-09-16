import { collection, getDocs, doc, setDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PlatformMessage {
  id: string;
  senderName: string;
  subject: string;
  preview: string;
  body: string;
  recipientId: string;
  read: boolean;
  date: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  storeId: string;
  content: string;
  createdAt: string;
}

const DEMO_STORE_MESSAGES: Message[] = [
  {
    id: 'store_msg_1',
    senderId: 'support_team',
    senderName: 'Tschüss Operations (Kleve)',
    recipientId: 'retailer_manager',
    storeId: 'store_rewe_kleve',
    content: 'Welcome to the Kleve food rescue network! Your initial batch of 6 surplus items is live on the consumer map. Pick-up window starts daily at 08:00.',
    createdAt: 'Today, 08:00'
  },
  {
    id: 'store_msg_2',
    senderId: 'retailer_manager',
    senderName: 'REWE Kleve (Manager)',
    recipientId: 'support_team',
    storeId: 'store_rewe_kleve',
    content: 'Thanks! We have verified that the express checkout lane will handle app pickups with the reservation codes.',
    createdAt: 'Today, 08:45'
  }
];

const DEMO_MESSAGES: PlatformMessage[] = [
  {
    id: 'msg_1',
    senderName: 'Tschüss Pilot Operations',
    subject: 'Welcome to Tschüss Retailer Network Kleve',
    preview: 'Your store profile is verified. Here are the top 3 best practices for markdowns...',
    body: 'Welcome to the Tschüss Retailer Network in Kleve! You can now publish surplus or short-dated items directly to local consumers. Remember that setting markdowns 24 hours prior to expiry achieves an 85% average sell-through rate.',
    recipientId: 'retailer_rewe_kleve',
    read: false,
    date: 'Today, 09:30'
  },
  {
    id: 'msg_2',
    senderName: 'Tschüss System',
    subject: 'Daily Digest: 5 Items Successfully Rescued Yesterday',
    preview: 'Congratulations! Your store diverted 3.2 kg of food waste yesterday...',
    body: 'Yesterday your store successfully fulfilled 2 reservations. Recovered revenue: €4.83. Estimated CO2e prevented: ~8.0 kg. Keep up the tremendous work!',
    recipientId: 'retailer_rewe_kleve',
    read: true,
    date: 'Yesterday, 21:00'
  }
];

export const messageService = {
  async getMessagesForUser(userId: string): Promise<PlatformMessage[]> {
    try {
      const q = query(collection(db, 'messages'), where('recipientId', '==', userId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as PlatformMessage));
      }
      return DEMO_MESSAGES;
    } catch {
      return DEMO_MESSAGES;
    }
  },

  async getStoreMessages(storeId: string): Promise<Message[]> {
    return DEMO_STORE_MESSAGES.filter(m => m.storeId === storeId);
  },

  async sendMessage(params: {
    senderId: string;
    senderName: string;
    recipientId: string;
    storeId: string;
    content: string;
  }): Promise<Message> {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      ...params,
      createdAt: 'Just now'
    };
    DEMO_STORE_MESSAGES.push(newMsg);
    return newMsg;
  }
};
