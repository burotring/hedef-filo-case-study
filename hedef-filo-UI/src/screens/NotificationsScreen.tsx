import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { NotificationItem } from '../components/NotificationItem';
import { BackendNotification } from '../types/api';
type RootStackParamList = {
  CaseList: undefined;
  CreateCase: undefined;
  CaseDetails: { caseId: string };
  CaseStatusTimeline: { caseId: string };
  Survey: { caseId: string };
  Notifications: undefined;
};
type NotificationsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Notifications'>;
interface Props {
  navigation: NotificationsScreenNavigationProp;
}
export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { 
    notifications, 
    notificationsLoading, 
    notificationsError, 
    unreadCount, 
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useAppContext();
  const handleNotificationPress = async (notification: BackendNotification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification._id);
      }
      navigation.navigate('CaseDetails', { caseId: notification.case._id });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      navigation.navigate('CaseDetails', { caseId: notification.case._id });
    }
  };
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bildirimler işaretlenirken hata oluştu.');
    }
  };
  const handleRefresh = () => {
    refreshNotifications();
  };
  const renderNotificationItem = ({ item }: { item: BackendNotification }) => (
    <NotificationItem 
      notification={item} 
      onPress={() => handleNotificationPress(item)} 
    />
  );
  const renderEmptyState = () => {
    if (notificationsLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.emptyText}>Bildirimler yükleniyor...</Text>
        </View>
      );
    }
    if (notificationsError) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Hata</Text>
          <Text style={styles.errorText}>{notificationsError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off-outline" size={64} color="#8E8E93" />
        <Text style={styles.emptyTitle}>Bildirim Yok</Text>
        <Text style={styles.emptyText}>Henüz hiç bildiriminiz bulunmuyor.</Text>
        <TouchableOpacity 
          style={styles.goToCasesButton} 
          onPress={() => navigation.navigate('CaseList')}
        >
          <Ionicons name="folder-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.goToCasesButtonText}>Vakalara Git</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Bildirimler</Text>
          <Text style={styles.subtitle}>
            {notifications.length} bildirim
            {unreadCount > 0 && ` • ${unreadCount} okunmamış`}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.markAllButton} 
            onPress={handleMarkAllAsRead}
          >
            <Ionicons name="checkmark-done" size={24} color="#34C759" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={notifications.length === 0 ? styles.emptyListContent : styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshing={notificationsLoading}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  subtitle: {
    fontSize: 14,
    color: '#86868B',
    marginTop: 2,
  },
  markAllButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#86868B',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#86868B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  goToCasesButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  goToCasesButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
