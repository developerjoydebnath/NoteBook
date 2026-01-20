import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// In Expo development, use your computer's IP address instead of localhost
// 192.168.1.108 is the current machine's IP
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.108:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle logout
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);
