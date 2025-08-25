import { useState, useEffect } from 'react';
import { apiClient } from '../api/config';
import { BackendSurvey, SurveyStats } from '../types/api';
export const useSurveys = (customerId?: string) => {
  const [surveys, setSurveys] = useState<BackendSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchSurveys = async () => {
    if (!customerId) {
      setSurveys([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/surveys', {
        params: { customerId }
      });
      setSurveys(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Anketler yüklenirken hata oluştu');
      console.error('Surveys fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSurveys();
  }, [customerId]);
  return {
    surveys,
    loading,
    error,
    refetch: fetchSurveys
  };
};
export const useSurveyStats = () => {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/surveys/stats');
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Anket istatistikleri yüklenirken hata oluştu');
      console.error('Survey stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStats();
  }, []);
  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};
