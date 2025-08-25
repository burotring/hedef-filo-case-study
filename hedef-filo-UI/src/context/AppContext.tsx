import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BackendCase, BackendNotification } from '../types/api';
import { useCases, useNotifications, useLookups } from '../hooks';
interface AppContextType {
  currentCustomerId: string;
  cases: BackendCase[];
  casesLoading: boolean;
  casesError: string | null;
  notifications: BackendNotification[];
  notificationsLoading: boolean;
  notificationsError: string | null;
  unreadCount: number;
  caseTypes: any[];
  statusCodes: any[];
  lookupsLoading: boolean;
  refreshCases: () => void;
  refreshNotifications: () => void;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  getCaseTypeLabel: (code: string) => string;
  getStatusLabel: (code: number) => string;
  getStatusColor: (code: number) => string;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
interface AppProviderProps {
  children: ReactNode;
}
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentCustomerId] = useState('CUST001');
  const {
    cases,
    loading: casesLoading,
    error: casesError,
    refetch: refreshCases
  } = useCases();
  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
    unreadCount,
    refetch: refreshNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications(currentCustomerId);
  const {
    caseTypes,
    statusCodes,
    loading: lookupsLoading,
    getCaseTypeLabel,
    getStatusLabel,
    getStatusColor,
    seedData
  } = useLookups();
  useEffect(() => {
    const initializeData = async () => {
      try {
        if (!lookupsLoading && caseTypes.length === 0) {
          await seedData();
        }
      } catch (error) {
        console.error('Backend bağlantısı başarısız:', error);
      }
    };
    initializeData();
  }, [lookupsLoading, caseTypes.length]);
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  };
  const markAllNotificationsAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  };
  const contextValue: AppContextType = {
    currentCustomerId,
    cases,
    casesLoading,
    casesError,
    notifications,
    notificationsLoading,
    notificationsError,
    unreadCount,
    caseTypes,
    statusCodes,
    lookupsLoading,
    refreshCases,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getCaseTypeLabel,
    getStatusLabel,
    getStatusColor
  };
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};