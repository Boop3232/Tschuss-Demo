import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  Tag, 
  ShoppingBag, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AppNotification } from '../../types';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/common/EmptyState';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = currentUser?.uid || userProfile?.uid || 'demo_consumer_123';

  useEffect(() => {
    const unsub = notificationService.subscribeToNotifications(userId, (items) => {
      setNotifications(items);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(userId);
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClickNotification = async (notif: AppNotification) => {
    if (!notif.read) {
      await notificationService.markAsRead(notif.id);
    }
    if (notif.targetUrl) {
      navigate(notif.targetUrl);
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'reservation_status':
        return ShoppingBag;
      case 'deal_alert':
        return Tag;
      case 'stock_alert':
        return Clock;
      default:
        return Bell;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">
            Notifications
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Stay updated on your reservations, deal alerts, and stock drops.
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            <CheckCheck className="w-4 h-4 text-emerald-700" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-stone-200 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-3xl bg-white overflow-hidden shadow-2xs">
          {notifications.map((notif) => {
            const Icon = getIcon(notif.type);
            return (
              <div
                key={notif.id}
                onClick={() => handleClickNotification(notif)}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  !notif.read ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-stone-50'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    !notif.read ? 'bg-emerald-900 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold truncate ${!notif.read ? 'text-stone-900' : 'text-stone-700'}`}>
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  <span className="text-3xs text-stone-400 whitespace-nowrap">
                    {typeof notif.createdAt === 'string' ? notif.createdAt : 'Just now'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When stores prepare your reservations or drop prices on your saved items, notifications will appear here."
        />
      )}
    </div>
  );
};
