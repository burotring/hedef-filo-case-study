import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useCases } from '../hooks';
import { BackendCase } from '../types/api';
import { apiClient } from '../api/config';
type RootStackParamList = {
  CaseList: undefined;
  CreateCase: undefined;
  CaseDetails: { caseId: string };
  CaseStatusTimeline: { caseId: string };
  Survey: { caseId: string };
  Notifications: undefined;
  Admin: undefined;
};
type AdminScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Admin'>;
interface Props {
  navigation: AdminScreenNavigationProp;
}
interface AdminStats {
  totalCases: number;
  openCases: number;
  closedCases: number;
  inProgressCases: number;
}
export const AdminScreen: React.FC<Props> = ({ navigation }) => {
  const { cases, caseTypes, statusCodes, refreshCases } = useAppContext();
  
  console.log('AdminScreen Debug:', {
    casesCount: cases.length,
    statusCodesCount: statusCodes.length,
    statusCodes: statusCodes.map(sc => ({ code: sc.code, name: sc.name, id: sc._id }))
  });
  const { createCase, deleteCase, updateCaseSupplier } = useCases();
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'create'>('overview');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showStatusChangeModal, setShowStatusChangeModal] = useState<BackendCase | null>(null);
  const [newCaseForm, setNewCaseForm] = useState({
    customerId: '',
    caseTypeCode: '',
    supplierId: '',
  });
  const adminStats: AdminStats = {
    totalCases: cases.length,
    openCases: cases.filter(c => c.lastState.code === 1).length, // OPEN = 1
    closedCases: cases.filter(c => c.lastState.isTerminal).length,
    inProgressCases: cases.filter(c => c.lastState.code === 2).length, // IN_PROGRESS = 2
  };
  const handleDeleteCase = async (caseId: string) => {
    try {
      setLoading(true);
      await deleteCase(caseId);
      await refreshCases();
      Alert.alert('Başarılı', 'Vaka başarıyla silindi!');
      setShowDeleteConfirm(null);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Vaka silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = async (newStatusCode: number) => {
    if (!showStatusChangeModal) return;
    try {
      setLoading(true);
      const newStatus = statusCodes.find(s => s.code === newStatusCode);
      if (!newStatus) {
        throw new Error('Geçersiz durum kodu');
      }
      console.log(`Vaka durumu güncelleniyor... ID: ${showStatusChangeModal._id}, Yeni Durum: ${newStatusCode}`);
      const response = await apiClient.put(`/api/cases/${showStatusChangeModal._id}/status`, {
        statusCode: newStatus.code // Backend expects number, use the actual code
      });
      console.log('VAKA DURUMU BAŞARIYLA GÜNCELLENDİ:', response.data);
      await refreshCases();
      setShowStatusChangeModal(null);
      Alert.alert('Başarılı', `Vaka durumu "${newStatus.name}" olarak güncellendi!`);
    } catch (error: any) {
      console.error('VAKA DURUMU GÜNCELLEME HATASI:', error.message);
      Alert.alert('Hata', error.response?.data?.error || 'Vaka durumu güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const handleCreateNewCase = async () => {
    if (!newCaseForm.customerId.trim() || !newCaseForm.caseTypeCode) {
      Alert.alert('Hata', 'Müşteri ID ve Vaka Türü zorunludur!');
      return;
    }
    try {
      setLoading(true);
      await createCase({
        customerId: newCaseForm.customerId.trim(),
        caseTypeCode: newCaseForm.caseTypeCode,
        supplierId: newCaseForm.supplierId.trim() || undefined,
      });
      await refreshCases();
      setShowCreateModal(false);
      setNewCaseForm({ customerId: '', caseTypeCode: '', supplierId: '' });
      Alert.alert('Başarılı', 'Yeni vaka oluşturuldu!');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Vaka oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionTitleContainer}>
        <Ionicons name="analytics-outline" size={24} color="#007AFF" />
        <Text style={styles.sectionTitle}>Sistem İstatistikleri</Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name="folder-outline" size={24} color="#1976D2" />
          <Text style={styles.statNumber}>{adminStats.totalCases}</Text>
          <Text style={styles.statLabel}>Toplam Vaka</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Ionicons name="time-outline" size={24} color="#F57C00" />
          <Text style={styles.statNumber}>{adminStats.openCases}</Text>
          <Text style={styles.statLabel}>Açık Vaka</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E8' }]}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#388E3C" />
          <Text style={styles.statNumber}>{adminStats.closedCases}</Text>
          <Text style={styles.statLabel}>Kapalı Vaka</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
          <Ionicons name="sync-outline" size={24} color="#7B1FA2" />
          <Text style={styles.statNumber}>{adminStats.inProgressCases}</Text>
          <Text style={styles.statLabel}>Devam Eden</Text>
        </View>
      </View>
      <View style={styles.sectionTitleContainer}>
        <Ionicons name="flash-outline" size={24} color="#007AFF" />
        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
      </View>
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
        <Text style={styles.quickActionText}>Yeni Vaka Oluştur</Text>
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={() => setActiveTab('cases')}
      >
        <Ionicons name="list-outline" size={24} color="#007AFF" />
        <Text style={styles.quickActionText}>Tüm Vakaları Yönet</Text>
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.quickActionButton}
        onPress={async () => {
          setLoading(true);
          await refreshCases();
          setLoading(false);
          Alert.alert('Başarılı', 'Veriler yenilendi!');
        }}
      >
        <Ionicons name="refresh-outline" size={24} color="#007AFF" />
        <Text style={styles.quickActionText}>Verileri Yenile</Text>
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </TouchableOpacity>
    </ScrollView>
  );
  const renderCaseItem = ({ item }: { item: BackendCase }) => {
    console.log('AdminScreen Case Item:', {
      caseId: item.caseId,
      statusName: item.lastState.name,
      isTerminal: item.lastState.isTerminal,
      shouldShowButton: !item.lastState.isTerminal
    });
    
    return (
    <View style={styles.adminCaseCard}>
      <View style={styles.caseHeader}>
        <Text style={styles.caseId}>#{item.caseId}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.lastState.isTerminal ? '#E8F5E8' : '#FFF3E0' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.lastState.isTerminal ? '#388E3C' : '#F57C00' }
          ]}>
            {item.lastState.name}
          </Text>
        </View>
      </View>
      <View style={styles.caseInfoRow}>
        <Ionicons name="person-outline" size={16} color="#8E8E93" />
        <Text style={styles.caseInfo}>{item.customer.customerId}</Text>
      </View>
      <View style={styles.caseInfoRow}>
        <Ionicons name="document-text-outline" size={16} color="#8E8E93" />
        <Text style={styles.caseInfo}>{item.caseType.name}</Text>
      </View>
      <View style={styles.caseInfoRow}>
        <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
        <Text style={styles.caseInfo}>{new Date(item.createDate).toLocaleDateString('tr-TR')}</Text>
      </View>
      {item.supplier && (
        <View style={styles.caseInfoRow}>
          <Ionicons name="business-outline" size={16} color="#8E8E93" />
          <Text style={styles.caseInfo}>{item.supplier.supplierId}</Text>
        </View>
      )}
      <View style={styles.caseActions}>
        {!item.lastState.isTerminal && (
          <TouchableOpacity 
            style={[styles.modernActionButton, styles.statusButton]}
            onPress={() => setShowStatusChangeModal(item)}
            disabled={loading}
          >
            <Ionicons name="sync-outline" size={18} color="#34C759" />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.modernActionButton, styles.viewButton]}
          onPress={() => navigation.navigate('CaseDetails', { caseId: item._id })}
        >
          <Ionicons name="eye-outline" size={18} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modernActionButton, styles.deleteButton]}
          onPress={() => setShowDeleteConfirm(item._id)}
          disabled={loading}
        >
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  )
  };
  const renderCasesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionTitleContainer}>
        <Ionicons name="list-outline" size={24} color="#007AFF" />
        <Text style={styles.sectionTitle}>Tüm Vakalar ({cases.length})</Text>
      </View>
      <FlatList
        data={cases}
        renderItem={renderCaseItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.casesList}
      />
    </View>
  );
  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <Text style={styles.modalCancelButton}>İptal</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Yeni Vaka Oluştur</Text>
          <TouchableOpacity 
            onPress={handleCreateNewCase}
            disabled={loading}
          >
            <Text style={[
              styles.modalSaveButton,
              loading && styles.modalSaveButtonDisabled
            ]}>
              {loading ? 'Yükleniyor...' : 'Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          <Text style={styles.inputLabel}>Müşteri ID *</Text>
          <TextInput
            style={styles.input}
            value={newCaseForm.customerId}
            onChangeText={(text) => setNewCaseForm(prev => ({ ...prev, customerId: text }))}
            placeholder="Örn: CUST001"
            autoCapitalize="characters"
          />
          <Text style={styles.inputLabel}>Vaka Türü *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsContainer}>
              {caseTypes.map((type) => (
                <TouchableOpacity
                  key={type._id}
                  style={[
                    styles.optionButton,
                    newCaseForm.caseTypeCode === type.code && styles.optionButtonSelected
                  ]}
                  onPress={() => setNewCaseForm(prev => ({ ...prev, caseTypeCode: type.code }))}
                >
                  <Text style={[
                    styles.optionText,
                    newCaseForm.caseTypeCode === type.code && styles.optionTextSelected
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text style={styles.inputLabel}>Tedarikçi ID (Opsiyonel)</Text>
          <TextInput
            style={styles.input}
            value={newCaseForm.supplierId}
            onChangeText={(text) => setNewCaseForm(prev => ({ ...prev, supplierId: text }))}
            placeholder="Örn: SUP456"
            autoCapitalize="characters"
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
  const renderDeleteConfirmModal = () => (
    <Modal
      visible={showDeleteConfirm !== null}
      transparent
      animationType="fade"
    >
      <View style={styles.deleteModalOverlay}>
        <View style={styles.deleteModalContent}>
          <Ionicons name="warning" size={48} color="#FF3B30" />
          <Text style={styles.deleteModalTitle}>Vaka Silinecek</Text>
          <Text style={styles.deleteModalText}>
            Bu işlem geri alınamaz. Vaka kalıcı olarak silinecek.
          </Text>
          <View style={styles.deleteModalActions}>
            <TouchableOpacity 
              style={[styles.deleteModalButton, { backgroundColor: '#F2F2F7' }]}
              onPress={() => setShowDeleteConfirm(null)}
            >
              <Text style={styles.deleteModalCancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.deleteModalButton, { backgroundColor: '#FF3B30' }]}
              onPress={() => showDeleteConfirm && handleDeleteCase(showDeleteConfirm)}
              disabled={loading}
            >
              <Text style={styles.deleteModalConfirmText}>
                {loading ? 'Yükleniyor...' : 'Sil'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  const renderStatusChangeModal = () => (
    <Modal
      visible={showStatusChangeModal !== null}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.statusModalOverlay}>
        <View style={styles.statusModalContainer}>
          <SafeAreaView style={styles.statusModalContent} edges={['top']}>
            <View style={styles.statusModalHeader}>
              <View style={styles.statusModalHeaderLeft}>
                <Ionicons name="sync-outline" size={24} color="#007AFF" />
                <Text style={styles.statusModalTitle}>
                  Vaka Durumu Güncelle
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.statusModalCloseButton}
                onPress={() => setShowStatusChangeModal(null)}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            {showStatusChangeModal && (
              <ScrollView 
                style={styles.statusModalBody} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.statusModalScrollContent}
              >
                <View style={styles.statusModalCaseInfo}>
                  <View style={styles.statusModalCaseHeader}>
                    <Text style={styles.statusModalCaseTitle}>
                      Vaka #{showStatusChangeModal.caseId}
                    </Text>
                    <View style={[
                      styles.statusModalCurrentBadge,
                      { backgroundColor: showStatusChangeModal.lastState.isTerminal ? '#E8F5E8' : '#FFF3E0' }
                    ]}>
                      <Text style={[
                        styles.statusModalCurrentBadgeText,
                        { color: showStatusChangeModal.lastState.isTerminal ? '#388E3C' : '#F57C00' }
                      ]}>
                        {showStatusChangeModal.lastState.name}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.statusModalCaseDetails}>
                    <View style={styles.statusModalDetailRow}>
                      <Ionicons name="person-outline" size={16} color="#8E8E93" />
                      <Text style={styles.statusModalDetailText}>
                        {showStatusChangeModal.customer.customerId}
                      </Text>
                    </View>
                    <View style={styles.statusModalDetailRow}>
                      <Ionicons name="document-text-outline" size={16} color="#8E8E93" />
                      <Text style={styles.statusModalDetailText}>
                        {showStatusChangeModal.caseType.name}
                      </Text>
                    </View>
                    <View style={styles.statusModalDetailRow}>
                      <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
                      <Text style={styles.statusModalDetailText}>
                        {new Date(showStatusChangeModal.createDate).toLocaleDateString('tr-TR')}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.statusModalDivider} />
                
                <View style={styles.statusModalSection}>
                  <View style={styles.statusModalSectionHeader}>
                    <Ionicons name="arrow-forward-outline" size={20} color="#007AFF" />
                    <Text style={styles.statusModalSectionTitle}>
                      Yeni Durum Seçin
                    </Text>
                  </View>
                  
                  <View style={styles.statusOptionsContainer}>
                    {statusCodes.map((status) => {
                      const isCurrentStatus = showStatusChangeModal.lastState.code === status.code;
                      const isDisabled = loading || isCurrentStatus;
                      
                      return (
                        <TouchableOpacity
                          key={status._id}
                          style={[
                            styles.statusOption,
                            isCurrentStatus && styles.statusOptionCurrent,
                            isDisabled && styles.statusOptionDisabled
                          ]}
                          onPress={() => handleStatusChange(status.code)}
                          disabled={isDisabled}
                        >
                          <View style={styles.statusOptionLeft}>
                            <View style={[
                              styles.statusOptionIcon,
                              { backgroundColor: isCurrentStatus ? '#34C759' : '#F0F0F0' }
                            ]}>
                              <Ionicons 
                                name={isCurrentStatus ? "checkmark" : "ellipse-outline"} 
                                size={16} 
                                color={isCurrentStatus ? "#FFFFFF" : "#8E8E93"} 
                              />
                            </View>
                            <View style={styles.statusOptionContent}>
                              <Text style={[
                                styles.statusOptionName,
                                isCurrentStatus && styles.statusOptionNameCurrent,
                                isDisabled && styles.statusOptionNameDisabled
                              ]}>
                                {status.name}
                              </Text>
                              {status.description && (
                                <Text style={[
                                  styles.statusOptionDescription,
                                  isDisabled && styles.statusOptionDescriptionDisabled
                                ]}>
                                  {status.description}
                                </Text>
                              )}
                            </View>
                          </View>
                          
                          {isCurrentStatus && (
                            <View style={styles.statusOptionCurrentIndicator}>
                              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                              <Text style={styles.statusOptionCurrentText}>Mevcut</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                
                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Durum güncelleniyor...</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Paneli</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Genel Bakış
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'cases' && styles.activeTab]}
          onPress={() => setActiveTab('cases')}
        >
          <Text style={[styles.tabText, activeTab === 'cases' && styles.activeTabText]}>
            Vakalar
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'cases' && renderCasesTab()}
      
      {renderCreateModal()}
      {renderDeleteConfirmModal()}
      {renderStatusChangeModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerPlaceholder: {
    width: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 12,
  },
  adminCaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  caseId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  caseInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseInfo: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  caseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  modernActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusButton: {
    backgroundColor: '#F0FDF4',
  },
  viewButton: {
    backgroundColor: '#EBF8FF',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  casesList: {
    paddingBottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalSaveButtonDisabled: {
    color: '#C7C7CC',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    minWidth: 270,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteModalCancelText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  deleteModalConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  statusModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    minHeight: '50%',
  },
  statusModalContent: {
    flex: 1,
  },
  statusModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  statusModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusModalCloseButton: {
    padding: 4,
  },
  statusModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusModalBody: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statusModalScrollContent: {
    paddingBottom: 20,
    paddingTop: 16,
  },
  statusModalCaseInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statusModalCaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusModalCaseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  statusModalCurrentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusModalCurrentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusModalCaseDetails: {
    gap: 8,
  },
  statusModalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusModalDetailText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusModalDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 20,
  },
  statusModalSection: {
    marginBottom: 20,
  },
  statusModalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statusModalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusOptionsContainer: {
    gap: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  statusOptionCurrent: {
    backgroundColor: '#E8F5E8',
    borderColor: '#34C759',
  },
  statusOptionDisabled: {
    opacity: 0.6,
  },
  statusOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  statusOptionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOptionContent: {
    flex: 1,
  },
  statusOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statusOptionNameCurrent: {
    color: '#34C759',
  },
  statusOptionNameDisabled: {
    color: '#C7C7CC',
  },
  statusOptionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusOptionDescriptionDisabled: {
    color: '#C7C7CC',
  },
  statusOptionCurrentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusOptionCurrentText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
});