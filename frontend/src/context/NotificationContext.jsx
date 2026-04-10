import React, {
  createContext, useContext, useState, useEffect, useCallback, useRef
} from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const POLL_INTERVAL = 30_000; // 30 seconds

export function NotificationProvider({ children }) {
  const { user }                            = useAuth();
  const [notifications, setNotifications]  = useState([]);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const intervalRef                         = useRef(null);

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
      setError(null);
    } catch (err) {
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Poll for new notifications when authenticated
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [user, fetchNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      setError('Erreur lors de la mise à jour');
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      setError('Erreur lors de la mise à jour');
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => {
        const removed = prev.find(n => n.id === id);
        if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n.id !== id);
      });
    } catch {
      setError('Erreur lors de la suppression');
    }
  }, []);

  // Add a local (optimistic) notification (useful for real-time via WebSocket)
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) setUnreadCount(c => c + 1);
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
}
