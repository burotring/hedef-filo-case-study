import { useState, useEffect } from 'react';
import { apiClient } from '../api/config';
import { BackendNotification } from '../types/api';
export const useNotifications = (customerId?: string) => {
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchNotifications = async () => {
    if (!customerId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      console.log(`Veritabanından bildirimler çekiliyor... (Müşteri: ${customerId})`);
      const response = await apiClient.get('/api/notifications', {
        params: { customerId }
      });
      console.log('BİLDİRİMLER BAŞARIYLA GETİRİLDİ:');
      console.log('Toplam bildirim sayısı:', response.data.length);
      const unreadCount = response.data.filter((n: BackendNotification) => !n.read).length;
      const readCount = response.data.length - unreadCount;
      console.log(`   Okunmamış: ${unreadCount} | 📭 Okunmuş: ${readCount}`);
      if (response.data.length > 0) {
        response.data.slice(0, 3).forEach((notification: BackendNotification, index: number) => {
          const readIcon = notification.read ? '📭' : '📬';
          console.log(`   ${index + 1}. ${readIcon} Vaka #${notification.case.caseId}: ${notification.message}`);
          console.log(`      Tarih: ${new Date(notification.createdAt).toLocaleDateString('tr-TR')}`);
        });
        if (response.data.length > 3) {
          console.log(`   ... ve ${response.data.length - 3} bildirim daha`);
        }
      } else {
        console.log('Henüz hiç bildirim bulunmuyor.');
      }
      setNotifications(response.data);
      console.log('Bildirimler başarıyla yüklendi!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bildirimler yüklenirken hata oluştu');
      console.error('BİLDİRİMLER HATASI:', err.message);
    } finally {
      setLoading(false);
    }
  };
  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Bildirim işaretlenirken hata oluştu';
      throw new Error(errorMsg);
    }
  };
  const markAllAsRead = async () => {
    if (!customerId) return;
    try {
      await apiClient.put('/notifications/mark-all-read', { customerId });
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Bildirimler işaretlenirken hata oluştu';
      throw new Error(errorMsg);
    }
  };
  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };
  useEffect(() => {
    fetchNotifications();
  }, [customerId]);
  return {
    notifications,
    loading,
    error,
    unreadCount: getUnreadCount(),
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};
