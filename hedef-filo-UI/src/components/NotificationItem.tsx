import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BackendNotification } from '../types/api';
interface NotificationItemProps {
  notification: BackendNotification;
  onPress: () => void;
}
export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };
  return (
    <TouchableOpacity 
      style={[styles.container, !notification.read && styles.unreadContainer]} 
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={[styles.message, !notification.read && styles.unreadMessage]}>
          {notification.message}
        </Text>
        <Text style={styles.date}>{formatDate(notification.createdAt)}</Text>
      </View>
      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadContainer: {
    backgroundColor: '#F8F9FA',
    borderLeftWidth: 3,
    borderLeftColor: '#3498DB',
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  unreadMessage: {
    color: '#2C3E50',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498DB',
    marginLeft: 8,
  },
});
