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
    senderName: 'Tschüss Operations',
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

const STORE_MESSAGES_CACHE_KEY = 'tschuss_store_messages_v1';

function readCachedStoreMessages(): Message[] {
  try {
    const value = localStorage.getItem(STORE_MESSAGES_CACHE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((message): message is Message =>
      !!message && typeof message.id === 'string' && typeof message.storeId === 'string'
    ) : [];
  } catch {
    return [];
  }
}

function cacheStoreMessages(messages: Message[]): void {
  try {
    localStorage.setItem(STORE_MESSAGES_CACHE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.warn('Could not cache retailer messages locally:', error);
  }
}

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
    const cachedMessages = readCachedStoreMessages();
    const messagesById = new Map<string, Message>();
    [...DEMO_STORE_MESSAGES, ...cachedMessages]
      .filter(message => message.storeId === storeId)
      .forEach(message => messagesById.set(message.id, message));

    try {
      const q = query(collection(db, 'messages'), where('storeId', '==', storeId));
      const snap = await getDocs(q);
      for (const messageDoc of snap.docs) {
        const data = messageDoc.data();
        messagesById.set(messageDoc.id, {
          id: messageDoc.id,
          senderId: typeof data.senderId === 'string' ? data.senderId : '',
          senderName: typeof data.senderName === 'string' ? data.senderName : 'Store team',
          recipientId: typeof data.recipientId === 'string' ? data.recipientId : '',
          storeId,
          content: typeof data.content === 'string' ? data.content : '',
          createdAt: typeof data.createdAt === 'string'
            ? data.createdAt
            : data.createdAt?.toDate?.()?.toISOString?.() || ''
        });
      }
    } catch (error) {
      console.warn('Could not load retailer messages from Firestore; using cached messages:', error);
    }

    const messages = Array.from(messagesById.values());
    const allCached = new Map(readCachedStoreMessages().map(message => [message.id, message]));
    messages.forEach(message => allCached.set(message.id, message));
    cacheStoreMessages(Array.from(allCached.values()));
    return messages;
  },

  async sendMessage(params: {
    senderId: string;
    senderName: string;
    recipientId: string;
    storeId: string;
    content: string;
  }): Promise<Message> {
    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...params,
      createdAt: new Date().toISOString()
    };
    DEMO_STORE_MESSAGES.push(newMsg);

    const cachedMessages = readCachedStoreMessages();
    cacheStoreMessages([newMsg, ...cachedMessages.filter(message => message.id !== newMsg.id)]);

    try {
      await setDoc(doc(db, 'messages', newMsg.id), {
        ...newMsg,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('Could not persist retailer message to Firestore; it remains in this browser cache:', error);
    }

    return newMsg;
  }
};
