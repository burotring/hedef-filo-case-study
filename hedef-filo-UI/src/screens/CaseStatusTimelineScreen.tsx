import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useCaseDetail } from '../hooks';
import { TimelineItem } from '../components/TimelineItem';

type RootStackParamList = {
  CaseList: undefined;
  CreateCase: undefined;
  CaseDetails: { caseId: string };
  CaseStatusTimeline: { caseId: string };
  Survey: { caseId: string };
  Notifications: undefined;
};

type CaseStatusTimelineScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CaseStatusTimeline'>;
type CaseStatusTimelineScreenRouteProp = RouteProp<RootStackParamList, 'CaseStatusTimeline'>;

interface Props {
  navigation: CaseStatusTimelineScreenNavigationProp;
  route: CaseStatusTimelineScreenRouteProp;
}

export const CaseStatusTimelineScreen: React.FC<Props> = ({ navigation, route }) => {
  const { getCaseTypeLabel } = useAppContext();
  const { caseId } = route.params;
  
  const { caseDetail, loading, error, refetch } = useCaseDetail(caseId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const handleRefresh = () => {
    refetch();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Timeline yükleniyor...</Text>
      </View>
    );
  }

  if (error || !caseDetail) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Hata</Text>
        <Text style={styles.errorText}>
          {error || 'Vaka timeline\'ı bulunamadı'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { case: caseItem, timeline } = caseDetail;

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
          <Text style={styles.title}>Durum Geçmişi</Text>
          <Text style={styles.subtitle}>
            Vaka #{caseItem.caseId} • {getCaseTypeLabel(caseItem.caseType.code)}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

      <View style={styles.timeline}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={24} color="#007AFF" />
          <Text style={styles.timelineTitle}>Olay Geçmişi</Text>
        </View>
        {timeline.map((event, index) => {
          const isLast = index === timeline.length - 1;
          const isActive = true;
          
          return (
            <TimelineItem
              key={`${event._id}-${index}`}
              event={event}
              isLast={isLast}
              isActive={isActive}
            />
          );
        })}
        
        {timeline.length === 0 && (
          <View style={styles.emptyTimeline}>
            <Text style={styles.emptyTimelineText}>Henüz hiç olay kaydedilmemiş.</Text>
          </View>
        )}
      </View>

      <View style={styles.summary}>
        <View style={styles.sectionHeader}>
          <Ionicons name="analytics-outline" size={24} color="#007AFF" />
          <Text style={styles.summaryTitle}>Özet</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Toplam Olay:</Text>
          <Text style={styles.summaryValue}>{timeline.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Başlangıç:</Text>
          <Text style={styles.summaryValue}>{formatDate(caseItem.createDate)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Son Güncelleme:</Text>
          <Text style={styles.summaryValue}>
            {formatDate(caseItem.updatedAt)}
          </Text>
        </View>
        {caseItem.completionDate && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tamamlanma:</Text>
            <Text style={styles.summaryValue}>{formatDate(caseItem.completionDate)}</Text>
          </View>
        )}
        
        {caseItem.lastState.isTerminal && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>Vaka Tamamlandı</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.detailsButton} 
          onPress={() => navigation.navigate('CaseDetails', { caseId })}
        >
          <Ionicons name="document-text-outline" size={20} color="#007AFF" />
          <Text style={styles.buttonText}>Vaka Detayları</Text>
        </TouchableOpacity>
        
        {caseItem.lastState.isTerminal && !caseDetail.survey && (
          <TouchableOpacity 
            style={styles.surveyButton} 
            onPress={() => navigation.navigate('Survey', { caseId })}
          >
            <Ionicons name="star-outline" size={20} color="#FF9500" />
            <Text style={styles.buttonText}>Anket Doldur</Text>
          </TouchableOpacity>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  timeline: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  emptyTimeline: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTimelineText: {
    fontSize: 16,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  summary: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#D5EDDA',
    borderColor: '#C3E6CB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  completedText: {
    color: '#155724',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    margin: 16,
    marginTop: 0,
    gap: 12,
  },
  detailsButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  surveyButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});   