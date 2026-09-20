import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  Tag, 
  ShoppingBag, 
  Sparkles,
  ChevronRight,
  Check,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { AppNotification } from '../../types';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { EmptyState } from '../../components/common/EmptyState';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { language, t } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const userId = currentUser?.uid || userProfile?.uid || 'demo_consumer_123';

  useEffect(() => {
    setLoading(true);
    const unsub = notificationService.subscribeToNotifications(userId, (items) => {
      setNotifications(items);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  const handleMarkAllRead = async () => {
    // 1. Instant optimistic update in component state
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // 2. Persistent storage + firestore sync + global custom event dispatch
    await notificationService.markAllAsRead(userId);
  };

  const handleToggleRead = async (e: React.MouseEvent, notif: AppNotification) => {
    e.stopPropagation();
    if (!notif.read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      await notificationService.markAsRead(notif.id, userId);
    }
  };

  const handleClickNotification = async (notif: AppNotification) => {
    if (!notif.read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      await notificationService.markAsRead(notif.id, userId);
    }
    if (notif.targetUrl) {
      navigate(notif.targetUrl);
    }
  };

  /**
   * Status-dependent badge coloring, icon, and localized label
   */
  const getNotificationTagMeta = (notif: AppNotification) => {
    const textLower = `${notif.title} ${notif.message}`.toLowerCase();

    if (notif.type === 'reservation_status') {
      // 1. Cancelled / Expired
      if (textLower.includes('cancel') || textLower.includes('storniert') || textLower.includes('expired') || textLower.includes('abgelaufen')) {
        return {
          icon: AlertCircle,
          label: language === 'de' ? 'Storniert' : 'Cancelled',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200/90',
          iconColor: 'text-rose-600'
        };
      }

      // 2. Ready for Pickup
      if (textLower.includes('ready') || textLower.includes('abholbereit') || textLower.includes('packed') || textLower.includes('gepackt')) {
        return {
          icon: Sparkles,
          label: language === 'de' ? 'Abholbereit' : 'Ready for Pickup',
          badgeBg: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-black',
          iconColor: 'text-emerald-700'
        };
      }

      // 3. Rescued / Collected / Completed
      if (textLower.includes('collected') || textLower.includes('rescued') || textLower.includes('completed') || textLower.includes('abgeholt') || textLower.includes('gerettet')) {
        return {
          icon: CheckCheck,
          label: language === 'de' ? 'Abgeholt' : 'Collected',
          badgeBg: 'bg-teal-50 text-teal-900 border-teal-200/90',
          iconColor: 'text-teal-700'
        };
      }

      // 4. Confirmed / Booked
      if (textLower.includes('confirmed') || textLower.includes('bestätigt') || textLower.includes('booked') || textLower.includes('gebucht') || textLower.includes('#ts-')) {
        return {
          icon: CheckCircle2,
          label: language === 'de' ? 'Bestätigt' : 'Confirmed',
          badgeBg: 'bg-sky-50 text-sky-900 border-sky-200/90',
          iconColor: 'text-sky-700'
        };
      }

      // 5. Default Pickup Status
      return {
        icon: ShoppingBag,
        label: language === 'de' ? 'Abholstatus' : 'Pickup Status',
        badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
        iconColor: 'text-emerald-700'
      };
    }

    if (notif.type === 'deal_alert' || notif.type === 'price_drop') {
      return {
        icon: Tag,
        label: language === 'de' ? 'Rettungs-Deal' : 'Rescue Deal',
        badgeBg: 'bg-amber-50 text-amber-900 border-amber-200/90',
        iconColor: 'text-amber-700'
      };
    }

    if (notif.type === 'stock_alert') {
      return {
        icon: Clock,
        label: language === 'de' ? 'Bestandswarnung' : 'Stock Alert',
        badgeBg: 'bg-orange-50 text-orange-900 border-orange-200/90',
        iconColor: 'text-orange-700'
      };
    }

    return {
      icon: Bell,
      label: language === 'de' ? 'Neuigkeit' : 'Update',
      badgeBg: 'bg-stone-100 text-stone-800 border-stone-200/90',
      iconColor: 'text-stone-600'
    };
  };

  /**
   * Format accurate local timestamp with local time instead of 'just now'
   */
  const formatLocalTimestamp = (rawTimestamp?: string | number | { seconds?: number; toDate?: () => Date } | any) => {
    let date: Date;
    try {
      if (!rawTimestamp) {
        date = new Date();
      } else if (typeof rawTimestamp === 'object') {
        if (typeof rawTimestamp.toDate === 'function') {
          date = rawTimestamp.toDate();
        } else if (typeof rawTimestamp.seconds === 'number') {
          date = new Date(rawTimestamp.seconds * 1000);
        } else {
          date = new Date();
        }
      } else if (typeof rawTimestamp === 'number') {
        date = new Date(rawTimestamp);
      } else if (typeof rawTimestamp === 'string') {
        date = new Date(rawTimestamp);
      } else {
        date = new Date();
      }

      if (isNaN(date.getTime())) {
        date = new Date();
      }
    } catch {
      date = new Date();
    }

    const now = new Date();
    const timeStr = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const isToday = 
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = 
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const isThisYear = date.getFullYear() === now.getFullYear();

    if (isToday) {
      return language === 'de' ? `Heute, ${timeStr}` : `Today, ${timeStr}`;
    }
    if (isYesterday) {
      return language === 'de' ? `Gestern, ${timeStr}` : `Yesterday, ${timeStr}`;
    }
    if (isThisYear) {
      const dateStr = date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
        day: 'numeric',
        month: 'short'
      });
      return `${dateStr}, ${timeStr}`;
    }

    const fullDateStr = date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return `${fullDateStr}, ${timeStr}`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Always sort with newest notifications appearing on top
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [notifications]);

  const filteredNotifications = filter === 'unread' 
    ? sortedNotifications.filter(n => !n.read)
    : sortedNotifications;

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight font-display">
              {language === 'de' ? 'Mitteilungen' : 'Notifications'}
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xs">
                {unreadCount} {language === 'de' ? 'neu' : 'new'}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'de' 
              ? 'Wichtige Updates zu deinen Reservierungen, Blitzangeboten und Abholzeiten.'
              : 'Live updates on your food reservations, markdown deals, and pickup windows.'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            id="btn-mark-all-read"
            onClick={handleMarkAllRead}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <CheckCheck className="w-4 h-4 text-emerald-700" />
            <span>{language === 'de' ? 'Alle als gelesen markieren' : 'Mark all as read'}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          id="filter-all-notifications"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          {language === 'de' ? 'Alle' : 'All'} ({notifications.length})
        </button>
        <button
          type="button"
          id="filter-unread-notifications"
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          {language === 'de' ? 'Ungelesen' : 'Unread'} ({unreadCount})
        </button>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-stone-200/70 rounded-2xl" />
          ))}
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const meta = getNotificationTagMeta(notif);
            const Icon = meta.icon;
            const localTimeString = formatLocalTimestamp(notif.createdAt);

            return (
              <div
                key={notif.id}
                id={`notification-card-${notif.id}`}
                onClick={() => handleClickNotification(notif)}
                className={`group relative rounded-2xl border transition-all cursor-pointer p-4 sm:p-5 flex flex-col gap-2.5 ${
                  !notif.read 
                    ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-emerald-200/90 shadow-xs' 
                    : 'bg-white hover:bg-stone-50/90 border-stone-200/80 shadow-2xs'
                }`}
              >
                {/* Top Row: Meta Badge, Subject/Title Preview, Time & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    {/* Category/Subject Tag with Status-Dependent Color */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-black uppercase tracking-wider border shrink-0 ${meta.badgeBg}`}>
                      <Icon className={`w-3.5 h-3.5 ${meta.iconColor}`} />
                      <span>{meta.label}</span>
                    </span>

                    {/* Subject/Title Headline */}
                    <span className={`text-sm font-bold truncate ${!notif.read ? 'text-stone-900 font-extrabold' : 'text-stone-700'}`}>
                      {notif.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span 
                      className="text-xs font-semibold text-stone-500 whitespace-nowrap"
                      title={notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                    >
                      {localTimeString}
                    </span>
                    {!notif.read && (
                      <span 
                        className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100 shrink-0" 
                        title="Unread"
                      />
                    )}
                  </div>
                </div>

                {/* Body Message Summary Preview (fully formatted on mobile & desktop) */}
                <div className="text-xs text-stone-600 leading-relaxed break-words pl-0.5">
                  {notif.message}
                </div>

                {/* Footer Action Links */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-200/40 mt-0.5 text-3xs">
                  {notif.targetUrl ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-800 group-hover:text-emerald-950 transition-colors">
                      <span>{language === 'de' ? 'Details ansehen' : 'View details'}</span>
                      <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  ) : (
                    <span />
                  )}

                  {!notif.read ? (
                    <button
                      type="button"
                      id={`btn-mark-read-${notif.id}`}
                      onClick={(e) => handleToggleRead(e, notif)}
                      className="inline-flex items-center gap-1 text-stone-500 hover:text-emerald-800 font-semibold px-2 py-0.5 rounded-md hover:bg-emerald-100/50 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      <span>{language === 'de' ? 'Als gelesen markieren' : 'Mark as read'}</span>
                    </button>
                  ) : (
                    <span className="text-stone-400 font-normal">
                      {language === 'de' ? 'Gelesen' : 'Read'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? (language === 'de' ? 'Keine ungelesenen Mitteilungen' : 'No unread notifications') : (language === 'de' ? 'Keine Mitteilungen' : 'No notifications yet')}
          description={language === 'de' ? 'Wenn Partner-Märkte deine Reservierungen packen oder Preise senken, wirst du sofort benachrichtigt.' : 'When stores pack your reservations or drop prices on your saved items, updates will appear here.'}
        />
      )}
    </div>
  );
};

