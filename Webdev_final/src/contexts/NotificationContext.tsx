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

// helper — key ใน localStorage
const LS_KEY = 'notif_read_ids';

const getReadIds = (): Set<number> => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch { return new Set(); }
};

const saveReadIds = (ids: Set<number>) => {
  localStorage.setItem(LS_KEY, JSON.stringify(Array.from(ids)));
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  const isLoggedIn = () => !!localStorage.getItem('access_token');

  // merge ข้อมูลจาก API กับ readIds ใน localStorage
  const mergeWithLocal = (data: NotifItem[]): NotifItem[] => {
    const readIds = getReadIds();
    return data.map(n => ({
      ...n,
      is_read: n.is_read || readIds.has(n.notification_id),
    }));
  };

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const res  = await api.get('/notifications');
      const raw  = Array.isArray(res.data) ? res.data : [];
      const data = mergeWithLocal(raw);
      setNotifications(data);
      setUnreadCount(data.filter((n: NotifItem) => !n.is_read).length);
    } catch { /* ไม่ logged in หรือ error */ }
  }, []);

  const markRead = async (id: number) => {
    // บันทึกลง localStorage ก่อน
    const readIds = getReadIds();
    readIds.add(id);
    saveReadIds(readIds);

    // เรียก API (fire and forget)
    api.patch(`/notifications/${id}/read`).catch(() => {});

    setNotifications(prev => prev.map(n =>
      n.notification_id === id ? { ...n, is_read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    // บันทึก id ทั้งหมดลง localStorage
    const readIds = getReadIds();
    notifications.forEach(n => readIds.add(n.notification_id));
    saveReadIds(readIds);

    // เรียก API (fire and forget)
    api.patch('/notifications/read-all').catch(() => {});

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
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