import { useState, useEffect } from 'react';
import { apiClient } from '../api/config';
import { BackendCaseType, BackendStatusCode } from '../types/api';
export const useLookups = () => {
  const [caseTypes, setCaseTypes] = useState<BackendCaseType[]>([]);
  const [statusCodes, setStatusCodes] = useState<BackendStatusCode[]>([
    { _id: '1', code: 1, name: 'Açık', isTerminal: false, description: 'Yeni oluşturulan vaka' },
    { _id: '2', code: 2, name: 'İnceleniyor', isTerminal: false, description: 'Vaka inceleme aşamasında' },
    { _id: '3', code: 3, name: 'Tamamlandı', isTerminal: true, description: 'Vaka başarıyla tamamlandı' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchLookups = async () => {
    try {
      setLoading(true);
      setError(null);
      const [caseTypesResponse, statusCodesResponse] = await Promise.all([
        apiClient.get('/api/lookups/case-types'),
        apiClient.get('/api/lookups/status-codes')
      ]);
      setCaseTypes(caseTypesResponse.data);
      setStatusCodes(statusCodesResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lookup verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  const seedData = async () => {
    try {
      await apiClient.post('/api/lookups/seed');
      await fetchLookups(); // Refresh data after seeding
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Başlangıç verileri oluşturulurken hata oluştu';
      throw new Error(errorMsg);
    }
  };
  const getCaseTypeByCode = (code: string) => {
    return caseTypes.find(ct => ct.code === code);
  };
  const getStatusByCode = (code: number) => {
    return statusCodes.find(sc => sc.code === code);
  };
  const getCaseTypeLabel = (code: string) => {
    const caseType = getCaseTypeByCode(code);
    if (!caseType) return code;
    switch (caseType.name.toLowerCase()) {
      case 'accident': return 'Kaza';
      case 'damage': return 'Hasar';
      case 'maintenance': return 'Bakım';
      default: return caseType.name;
    }
  };
  const getStatusLabel = (code: number) => {
    const status = getStatusByCode(code);
    if (!status) {
      // Fallback için direkt mapping
      switch (code) {
        case 1: return 'Açık';
        case 2: return 'İnceleniyor';
        case 3: return 'Tamamlandı';
        default: return `Durum ${code}`;
      }
    }
    return status.name;
  };
  const getStatusColor = (code: number) => {
    switch (code) {
      case 1: return '#FF6B6B'; // Açık - Kırmızı
      case 2: return '#4ECDC4'; // İnceleniyor - Turkuaz  
      case 3: return '#96CEB4'; // Tamamlandı - Yeşil
      default: return '#95A5A6'; // Varsayılan - Gri
    }
  };
  useEffect(() => {
    fetchLookups();
  }, []);
  return {
    caseTypes,
    statusCodes,
    loading,
    error,
    refetch: fetchLookups,
    seedData,
    getCaseTypeByCode,
    getStatusByCode,
    getCaseTypeLabel,
    getStatusLabel,
    getStatusColor
  };
};
