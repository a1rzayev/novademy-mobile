import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: Platform.OS === 'android' 
    ? 'http://10.0.2.2:5258/api/v1'  // Android emulator
    : 'http://localhost:5258/api/v1', // iOS simulator
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    console.log('Making request to:', {
      fullUrl: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      url: response.config.url,
      fullUrl: `${response.config.baseURL}${response.config.url}`,
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      fullUrl: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - server might not be running or port is blocked');
    } else if (!error.response) {
      console.error('Network error - no response received');
    }

    if (error.response?.status === 401) {
      console.log('Unauthorized access, removing token');
      await AsyncStorage.removeItem('authToken');
    }

    return Promise.reject(error);
  }
);

export default apiClient; 