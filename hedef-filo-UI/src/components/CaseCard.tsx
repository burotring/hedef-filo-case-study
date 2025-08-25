import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackendCase } from '../types/api';
import { useAppContext } from '../context/AppContext';
interface CaseCardProps {
  case: BackendCase;
  onPress: () => void;
  onSurveyPress?: () => void;
  hasSurvey?: boolean;
  isAdminView?: boolean;
}
export const CaseCard: React.FC<CaseCardProps> = ({ 
  case: caseItem, 
  onPress, 
  onSurveyPress,
  hasSurvey = false,
  isAdminView = false
}) => {
  const { getStatusColor, getStatusLabel, getCaseTypeLabel } = useAppContext();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.caseId}>Vaka #{caseItem.caseId}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(caseItem.lastState.code) }]}>
          <Text style={styles.statusText}>{getStatusLabel(caseItem.lastState.code)}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Müşteri ID: <Text style={styles.value}>{caseItem.customer.customerId}</Text></Text>
        <Text style={styles.label}>Tür: <Text style={styles.value}>{getCaseTypeLabel(caseItem.caseType.code)}</Text></Text>
        <Text style={styles.label}>Oluşturma Tarihi: <Text style={styles.value}>{formatDate(caseItem.createDate)}</Text></Text>
        {caseItem.supplier && (
          <Text style={styles.label}>Tedarikçi: <Text style={styles.value}>{caseItem.supplier.supplierId}</Text></Text>
        )}
        {caseItem.completionDate && (
          <Text style={styles.label}>Tamamlanma: <Text style={styles.value}>{formatDate(caseItem.completionDate)}</Text></Text>
        )}
      </View>
      {hasSurvey && onSurveyPress && caseItem.lastState.isTerminal && !isAdminView && (
        <View style={styles.surveyButtonContainer}>
          <TouchableOpacity style={styles.surveyButton} onPress={onSurveyPress}>
            <Ionicons name="clipboard-outline" size={16} color="#FFFFFF" />
            <Text style={styles.surveyButtonText}>Anket Doldur</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  caseId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#86868B',
    fontWeight: '500',
  },
  value: {
    color: '#1D1D1F',
    fontWeight: '600',
  },
  surveyButtonContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
  },
  surveyButton: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  surveyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
