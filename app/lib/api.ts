import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// In Expo development, use your computer's IP address instead of localhost
// Live API: https://note-book-api-server.vercel.app/api
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://note-book-api-server.vercel.app/api';

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
