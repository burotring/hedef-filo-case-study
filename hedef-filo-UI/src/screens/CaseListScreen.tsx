import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { CaseCard } from '../components/CaseCard';
import { BackendCase } from '../types/api';
import { useSurveys } from '../hooks';
type RootStackParamList = {
  CaseList: undefined;
  CreateCase: undefined;
  CaseDetails: { caseId: string };
  CaseStatusTimeline: { caseId: string };
  Survey: { caseId: string };
  Notifications: undefined;
  Admin: undefined;
  AdminLogin: undefined;
};
type CaseListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CaseList'>;
interface Props {
  navigation: CaseListScreenNavigationProp;
}
export const CaseListScreen: React.FC<Props> = ({ navigation }) => {
  const { 
    cases, 
    casesLoading, 
    casesError, 
    unreadCount, 
    refreshCases,
    lookupsLoading 
  } = useAppContext();
  const { surveys } = useSurveys(); // Survey durumlarını kontrol et
  const handleCasePress = (caseItem: BackendCase) => {
    navigation.navigate('CaseDetails', { caseId: caseItem._id });
  };
  const handleCreateCase = () => {
    if (lookupsLoading) {
      Alert.alert('Bekleyin', 'Sistem verileri yükleniyor...');
      return;
    }
    navigation.navigate('CreateCase');
  };
  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };
  const handleRefresh = () => {
    refreshCases();
  };
  const renderCaseItem = ({ item }: { item: BackendCase }) => {
    const hasSurvey = surveys.some(survey => survey.case === item._id);
    const handleSurveyPress = () => {
      navigation.navigate('Survey', { caseId: item._id });
    };
    return (
      <CaseCard 
        case={item} 
        onPress={() => handleCasePress(item)}
        onSurveyPress={handleSurveyPress}
        hasSurvey={hasSurvey}
      />
    );
  };
  const renderEmptyState = () => {
    if (casesLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3498DB" />
          <Text style={styles.emptyText}>Vakalar yükleniyor...</Text>
        </View>
      );
    }
    if (casesError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorTitle}>Hata</Text>
          <Text style={styles.errorText}>{casesError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Vaka Yok</Text>
        <Text style={styles.emptyText}>Henüz hiç vakanız bulunmuyor.</Text>
        <TouchableOpacity style={styles.createFirstButton} onPress={handleCreateCase}>
          <Text style={styles.createFirstButtonText}>İlk Vakayı Oluştur</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Vakalar</Text>
          <Text style={styles.subtitle}>{cases.length} vaka</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleNotifications}
          >
            <Ionicons name="notifications-outline" size={24} color="#007AFF" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={cases}
        renderItem={renderCaseItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={cases.length === 0 ? styles.emptyListContent : styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshing={casesLoading}
        onRefresh={handleRefresh}
      />
      {cases.length > 0 && (
        <SafeAreaView edges={['bottom']} style={styles.createButtonContainer}>
          <TouchableOpacity 
            style={[styles.createButton, lookupsLoading && styles.createButtonDisabled]} 
            onPress={handleCreateCase}
            disabled={lookupsLoading}
          >
            <Ionicons 
              name="add-circle" 
              size={20} 
              color="#FFFFFF" 
              style={styles.createButtonIcon} 
            />
            <Text style={styles.createButtonText}>
              {lookupsLoading ? 'Yükleniyor...' : 'Yeni Vaka Oluştur'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '400',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
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
  createFirstButton: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  createButtonContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  createButtonDisabled: {
    backgroundColor: '#95A5A6',
    shadowOpacity: 0.1,
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});