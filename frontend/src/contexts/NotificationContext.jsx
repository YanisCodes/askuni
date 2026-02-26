import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const intervalRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      intervalRef.current = setInterval(loadNotifications, 30000);
    } else {
      setNotifications([]);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, loadNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // silently fail
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch {
      // silently fail
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
