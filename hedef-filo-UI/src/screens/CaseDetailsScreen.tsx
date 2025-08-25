import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useCaseDetail } from '../hooks';
type RootStackParamList = {
  CaseList: undefined;
  CreateCase: undefined;
  CaseDetails: { caseId: string };
  CaseStatusTimeline: { caseId: string };
  Survey: { caseId: string };
  Notifications: undefined;
};
type CaseDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CaseDetails'>;
type CaseDetailsScreenRouteProp = RouteProp<RootStackParamList, 'CaseDetails'>;
interface Props {
  navigation: CaseDetailsScreenNavigationProp;
  route: CaseDetailsScreenRouteProp;
}
export const CaseDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { getStatusColor, getStatusLabel, getCaseTypeLabel } = useAppContext();
  const { caseId } = route.params;
  const { caseDetail, loading, error, refetch } = useCaseDetail(caseId);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };
  const handleViewTimeline = () => {
    navigation.navigate('CaseStatusTimeline', { caseId });
  };
  const handleRefresh = () => {
    refetch();
  };
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Vaka detayları yükleniyor...</Text>
      </View>
    );
  }
  if (error || !caseDetail) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Hata</Text>
        <Text style={styles.errorText}>
          {error || 'Vaka detayları bulunamadı'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const { case: caseItem, timeline, survey } = caseDetail;
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Vaka #{caseItem.caseId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(caseItem.lastState.code) }]}>
          <Text style={styles.statusText}>{getStatusLabel(caseItem.lastState.code)}</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Müşteri ID:</Text>
          <Text style={styles.value}>{caseItem.customer.customerId}</Text>
        </View>
        {caseItem.customer.name && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Müşteri Adı:</Text>
            <Text style={styles.value}>{caseItem.customer.name}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Vaka Türü:</Text>
          <Text style={styles.value}>{getCaseTypeLabel(caseItem.caseType.code)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Oluşturma Tarihi:</Text>
          <Text style={styles.value}>{formatDate(caseItem.createDate)}</Text>
        </View>
        {caseItem.supplier && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tedarikçi ID:</Text>
            <Text style={styles.value}>{caseItem.supplier.supplierId}</Text>
          </View>
        )}
        {caseItem.completionDate && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tamamlanma:</Text>
            <Text style={styles.value}>{formatDate(caseItem.completionDate)}</Text>
          </View>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Durum Bilgisi</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Mevcut Durum:</Text>
          <Text style={[styles.value, { color: getStatusColor(caseItem.lastState.code) }]}>
            {getStatusLabel(caseItem.lastState.code)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Son Güncelleme:</Text>
          <Text style={styles.value}>
            {formatDate(caseItem.updatedAt)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Toplam Olay:</Text>
          <Text style={styles.value}>{timeline.length} olay</Text>
        </View>
      </View>
      {survey && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anket Sonucu</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Müşteri Memnuniyet Puanı:</Text>
            <Text style={styles.value}>{survey.rating}/5 yıldız</Text>
          </View>
          {survey.comment && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Yorum:</Text>
              <Text style={styles.value}>{survey.comment}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Anket Tarihi:</Text>
            <Text style={styles.value}>{formatDate(survey.createdAt)}</Text>
          </View>
        </View>
      )}
      <SafeAreaView edges={['bottom']} style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.timelineButton} onPress={handleViewTimeline}>
          <Ionicons name="time-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Durum Geçmişi ({timeline.length})</Text>
        </TouchableOpacity>
      </SafeAreaView>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
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
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#95A5A6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actionButtonsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  timelineButton: {
    backgroundColor: '#007AFF',
    padding: 16,
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
    padding: 16,
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
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});