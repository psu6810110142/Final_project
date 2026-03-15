import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

interface NotifItem {
  notification_id: number;
  title: string;
  message: string;
  type: 'payment_approved' | 'payment_rejected' | 'general';
  is_read: boolean;
  order_id: number | null;
  created_at: string;
}

interface NotifContextType {
  notifications: NotifItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotifContext = createContext<NotifContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isLoggedIn = () => !!localStorage.getItem('access_token');

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const res = await api.get('/notifications');
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
      setUnreadCount(data.filter((n: NotifItem) => !n.is_read).length);
    } catch { /* ไม่ logged in หรือ error */ }
  }, []);

  const markRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
    // poll ทุก 30 วิ
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, fetchNotifications, markRead, markAllRead }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
  return ctx;
};
