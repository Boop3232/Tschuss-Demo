import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  User, 
  Store
} from 'lucide-react';
import { messageService, Message } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';

export const RetailerMessagesPage: React.FC = () => {
  const { userProfile, currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const storeId = 'store_rewe_kleve';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const msgs = await messageService.getStoreMessages(storeId);
        setMessages(msgs);
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [storeId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await messageService.sendMessage({
        senderId: currentUser?.uid || 'retailer_manager',
        senderName: userProfile?.name || 'REWE Kleve (Manager)',
        recipientId: 'support_team',
        storeId,
        content: newMessage.trim()
      });

      setNewMessage('');
      const updated = await messageService.getStoreMessages(storeId);
      setMessages(updated);
    } catch (err) {
      console.error('Could not send retailer support message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">
          Partner Support & Announcements
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Communicate with the Tschüss local city coordination team regarding logistics and pickup schedules.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden flex flex-col h-[520px]">
        {/* Messages feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {loading ? (
            <p className="text-center text-xs text-stone-500 py-8">Loading messages…</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-xs text-stone-500 py-8">No messages yet. Send a message to contact the support team.</p>
          ) : messages.map((m) => {
            const isManager = m.senderId === 'retailer_manager' || m.senderId === currentUser?.uid;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isManager ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-3xs font-bold text-stone-500">{m.senderName}</span>
                </div>
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isManager
                      ? 'bg-emerald-900 text-white rounded-tr-xs'
                      : 'bg-stone-100 text-stone-800 rounded-tl-xs'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-4 border-t border-stone-200 bg-stone-50 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message to Tschüss operations team..."
            className="flex-1 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sending ? 'Sending…' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
