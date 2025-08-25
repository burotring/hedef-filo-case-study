import { useState, useEffect } from 'react';
import { apiClient } from '../api/config';
import { 
  BackendCase, 
  CaseDetailResponse, 
  CreateCaseRequest, 
  UpdateCaseStatusRequest, 
  UpdateSupplierRequest,
  CreateSurveyRequest 
} from '../types/api';
export const useCases = (customerId?: string) => {
  const [cases, setCases] = useState<BackendCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = customerId ? { customerId } : {};
      console.log('Veritabanından vakalar çekiliyor...', params.customerId ? `(Müşteri: ${params.customerId})` : '(Tüm vakalar)');
      const response = await apiClient.get('/api/cases', { params });
      console.log('VAKALAR BAŞARIYLA GETİRİLDİ:');
      console.log('Toplam vaka sayısı:', response.data.length);
      if (response.data.length > 0) {
        response.data.forEach((caseItem: BackendCase, index: number) => {
          const statusIcon = caseItem.lastState.isTerminal ? '[TAMAMLANDI]' : '[DEVAM EDIYOR]';
          console.log(`   ${index + 1}. Vaka #${caseItem.caseId} - ${caseItem.customer.customerId} - ${caseItem.caseType.name} ${statusIcon}`);
          console.log(`      Durum: ${caseItem.lastState.name} | Oluşturma: ${new Date(caseItem.createDate).toLocaleDateString('tr-TR')}`);
          if (caseItem.supplier) {
            console.log(`      Tedarikçi: ${caseItem.supplier.supplierId}`);
          }
        });
      } else {
        console.log('Henüz hiç vaka bulunmuyor.');
      }
      setCases(response.data);
      console.log('Vakalar başarıyla yüklendi!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Vakalar yüklenirken hata oluştu');
      console.error('VAKALAR HATASI:', err.message);
    } finally {
      setLoading(false);
    }
  };
  const createCase = async (caseData: Omit<CreateCaseRequest, 'caseId'>): Promise<BackendCase> => {
    try {
      const caseId = Date.now();
      console.log('Yeni vaka oluşturuluyor...', {
        caseId,
        customerId: caseData.customerId,
        caseType: caseData.caseTypeCode,
        supplier: caseData.supplierId || 'Yok'
      });
      const response = await apiClient.post('/api/cases', {
        ...caseData,
        caseId
      });
      const newCase = response.data;
      console.log('YENİ VAKA BAŞARIYLA OLUŞTURULDU:');
      console.log(`   Vaka ID: #${newCase.caseId}`);
      console.log(`   Müşteri: ${newCase.customer.customerId}`);
      console.log(`   Tür: ${newCase.caseType.name}`);
      console.log(`   Durum: ${newCase.lastState.name}`);
      console.log(`   Oluşturma: ${new Date(newCase.createDate).toLocaleDateString('tr-TR')}`);
      if (!customerId || newCase.customer.customerId === customerId) {
        setCases(prev => [newCase, ...prev]);
      }
      return newCase;
    } catch (err: any) {
      console.error('VAKA OLUŞTURMA HATASI:', err.message);
      const errorMsg = err.response?.data?.error || 'Vaka oluşturulurken hata oluştu';
      throw new Error(errorMsg);
    }
  };
  const updateCaseStatus = async (caseId: string, statusCode: number): Promise<BackendCase> => {
    try {
      const response = await apiClient.put(`/api/cases/${caseId}/status`, { statusCode });
      const updatedCase = response.data;
      setCases(prev => prev.map(c => c._id === caseId ? updatedCase : c));
      return updatedCase;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Vaka durumu güncellenirken hata oluştu';
      throw new Error(errorMsg);
    }
  };
  const updateCaseSupplier = async (caseId: string, supplierId: string): Promise<BackendCase> => {
    try {
      const response = await apiClient.put(`/api/cases/${caseId}/supplier`, { supplierId });
      const updatedCase = response.data;
      setCases(prev => prev.map(c => c._id === caseId ? updatedCase : c));
      return updatedCase;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Tedarikçi güncellenirken hata oluştu';
      throw new Error(errorMsg);
    }
  };
  useEffect(() => {
    fetchCases();
  }, [customerId]); // Only refetch when customerId changes
  const deleteCase = async (caseId: string) => {
    try {
      console.log(`Vaka siliniyor... ID: ${caseId}`);
      await apiClient.delete(`/api/cases/${caseId}`);
      setCases(prev => prev.filter(c => c._id !== caseId));
      console.log('VAKA BAŞARIYLA SİLİNDİ');
    } catch (err: any) {
      console.error('VAKA SİLME HATASI:', err.message);
      const errorMsg = err.response?.data?.error || 'Vaka silinirken hata oluştu';
      throw new Error(errorMsg);
    }
  };
  return {
    cases,
    loading,
    error,
    refetch: fetchCases,
    createCase,
    updateCaseStatus,
    updateCaseSupplier,
    deleteCase,
  };
};
export const useCaseDetail = (caseId: string) => {
  const [caseDetail, setCaseDetail] = useState<CaseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCaseDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/cases/${caseId}`);
      setCaseDetail(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Vaka detayları yüklenirken hata oluştu');
      console.error('Case detail fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  const createSurvey = async (surveyData: CreateSurveyRequest) => {
    try {
      const response = await apiClient.post(`/api/cases/${caseId}/survey`, surveyData);
      setCaseDetail(prev => prev ? { ...prev, survey: response.data } : null);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Anket kaydedilirken hata oluştu';
      throw new Error(errorMsg);
    }
  };
  useEffect(() => {
    if (caseId) {
      fetchCaseDetail();
    }
  }, [caseId]);
  return {
    caseDetail,
    loading,
    error,
    refetch: fetchCaseDetail,
    createSurvey
  };
};
