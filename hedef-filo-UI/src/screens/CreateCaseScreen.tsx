import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppContext } from '../context/AppContext';
import { useCases } from '../hooks';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  CaseList: undefined;
  CreateCase: undefined;
  CaseDetails: { caseId: string };
  CaseStatusTimeline: { caseId: string };
  Survey: { caseId: string };
  Notifications: undefined;
};

type CreateCaseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateCase'>;

interface Props {
  navigation: CreateCaseScreenNavigationProp;
}

export const CreateCaseScreen: React.FC<Props> = ({ navigation }) => {
  const { caseTypes, getCaseTypeLabel, refreshCases } = useAppContext();
  const { createCase } = useCases();
  
  const customerId = 'CUST001'; // Fixed customer ID - cannot be changed
  const [selectedCaseType, setSelectedCaseType] = useState(caseTypes[0]?.code || '');
  const [supplierId, setSupplierId] = useState('');
  const [showCaseTypeDropdown, setShowCaseTypeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedCaseType) {
      Alert.alert('Hata', 'Vaka türü seçimi zorunludur.');
      return;
    }

    try {
      setLoading(true);
      await createCase({
        customerId: customerId.trim(),
        caseTypeCode: selectedCaseType,
        supplierId: supplierId.trim() || undefined,
      });
      
      console.log('Ana vaka listesi yenileniyor...');
      await refreshCases();
      
      Alert.alert(
        'Başarılı', 
        'Vaka başarıyla oluşturuldu!',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('CaseList'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Vaka oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (caseTypes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Vaka türleri yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Yeni Vaka Oluştur</Text>
        
        <View style={styles.customerInfo}>
          <Text style={styles.customerLabel}>Müşteri: CUST001</Text>
          <Text style={styles.customerNote}>Sabit müşteri (değiştirilemez)</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Vaka Türü *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => !loading && setShowCaseTypeDropdown(!showCaseTypeDropdown)}
            disabled={loading}
          >
            <Text style={styles.dropdownText}>
              {selectedCaseType ? getCaseTypeLabel(selectedCaseType) : 'Vaka türü seçiniz'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          {showCaseTypeDropdown && (
            <View style={styles.dropdownOptions}>
              {caseTypes.map((type) => (
                <TouchableOpacity
                  key={type._id}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setSelectedCaseType(type.code);
                    setShowCaseTypeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>
                    {getCaseTypeLabel(type.code)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tedarikçi ID (İsteğe bağlı)</Text>
          <TextInput
            style={styles.input}
            value={supplierId}
            onChangeText={setSupplierId}
            placeholder="Tedarikçi ID giriniz"
            autoCapitalize="characters"
            editable={!loading}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Otomatik Atanan Bilgiler:</Text>
          <Text style={styles.infoText}>• Vaka ID: Otomatik oluşturulacak</Text>
          <Text style={styles.infoText}>• Oluşturma Tarihi: {new Date().toLocaleDateString('tr-TR')}</Text>
          <Text style={styles.infoText}>• Durum: Açık</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.cancelButton, loading && styles.buttonDisabled]} 
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.buttonDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 24,
    textAlign: 'center',
  },
  customerInfo: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  customerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  customerNote: {
    fontSize: 14,
    color: '#8E8E93',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BDC3C7',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -1,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  infoBox: {
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2980B9',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2980B9',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#95A5A6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});