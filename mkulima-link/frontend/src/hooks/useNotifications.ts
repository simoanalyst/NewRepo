import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { Notification } from '../types';
import apiClient from '../api/client';
import { useSnackbar } from 'notistack';

let socket: Socket | null = null;

export function useNotifications() {
  const { user, accessToken } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/notifications');
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user || !accessToken) return;

    fetchNotifications();

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';
    socket = io(SOCKET_URL, { auth: { token: accessToken } });

    socket.on('connect', () => {
      socket?.emit('join-room', user.id);
    });

    socket.on('new-order', () => {
      enqueueSnackbar('New order received!', { variant: 'info' });
      fetchNotifications();
    });

    socket.on('payment-success', () => {
      enqueueSnackbar('Payment received!', { variant: 'success' });
      fetchNotifications();
    });

    socket.on('order-update', (data: { status: string }) => {
      enqueueSnackbar(`Order status: ${data.status}`, { variant: 'info' });
      fetchNotifications();
    });

    return () => { socket?.disconnect(); };
  }, [user, accessToken, fetchNotifications, enqueueSnackbar]);

  const markRead = async (ids?: string[]) => {
    try {
      await apiClient.patch('/notifications/read', { ids });
      await fetchNotifications();
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  return { notifications, unreadCount, fetchNotifications, markRead, markAllRead };
}
