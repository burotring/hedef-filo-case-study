import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BackendCaseEvent } from '../types/api';
import { useAppContext } from '../context/AppContext';
interface TimelineItemProps {
  event: BackendCaseEvent;
  isLast: boolean;
  isActive: boolean;
}
export const TimelineItem: React.FC<TimelineItemProps> = ({ event, isLast, isActive }) => {
  const { getStatusLabel } = useAppContext();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };
  const getEventTitle = () => {
    switch (event.type) {
      case 'STATUS_CHANGED':
        return event.toStatus ? getStatusLabel(event.toStatus.code) : 'Durum Değişti';
      case 'SERVICE_CHANGED':
        return 'Hizmet Değişti';
      case 'NOTE':
        return 'Not Eklendi';
      default:
        return 'Sistem Olayı';
    }
  };
  const getEventDescription = () => {
    if (event.note) return event.note;
    if (event.type === 'STATUS_CHANGED' && event.fromStatus && event.toStatus) {
      return `${getStatusLabel(event.fromStatus.code)} → ${getStatusLabel(event.toStatus.code)}`;
    }
    return '';
  };
  return (
    <View style={styles.container}>
      <View style={styles.leftColumn}>
        <View style={[styles.dot, isActive && styles.activeDot]} />
        {!isLast && <View style={[styles.line, isActive && styles.activeLine]} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.statusName, isActive && styles.activeStatusName]}>
          {getEventTitle()}
        </Text>
        <Text style={styles.date}>{formatDate(event.createdAt)}</Text>
        {getEventDescription() && (
          <Text style={styles.description}>{getEventDescription()}</Text>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#BDC3C7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  activeDot: {
    backgroundColor: '#3498DB',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#BDC3C7',
    marginTop: 4,
  },
  activeLine: {
    backgroundColor: '#3498DB',
  },
  content: {
    flex: 1,
    paddingTop: -2,
  },
  statusName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 4,
  },
  activeStatusName: {
    color: '#2C3E50',
  },
  date: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 18,
  },
});
