import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl;
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:4000';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:4000';
  } else if (Platform.OS === 'android') {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      return `http://${host}:4000`;
    }
    return 'http://10.0.2.2:4000';
  }
  return 'http://localhost:4000';
};
export const API_BASE_URL = getApiBaseUrl();
console.log('API Base URL:', API_BASE_URL);
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status >= 400) {
    }
    return Promise.reject(error);
  }
);
export default apiClient;
