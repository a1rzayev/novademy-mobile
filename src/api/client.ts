import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'https://novademy-api.azurewebsites.net/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add development environment check
if (__DEV__) {
  console.log('API Client initialized with baseURL:', apiClient.defaults.baseURL);
}

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    console.log('Making request to:', {
      fullUrl: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data,
      token: token ? `${token.substring(0, 10)}...` : 'no token'
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Log the decoded token payload for debugging
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Convert Unix timestamps (seconds) to milliseconds for Date objects
        const expDate = payload.exp ? new Date(payload.exp * 1000) : null;
        const iatDate = payload.iat ? new Date(payload.iat * 1000) : null;
        const nbfDate = payload.nbf ? new Date(payload.nbf * 1000) : null;
        
        console.log('Token payload:', {
          id: payload.id,
          sub: payload.sub,
          role: payload.role,
          exp: expDate?.toISOString() || 'not set',
          iat: iatDate?.toISOString() || 'not set',
          iss: payload.iss,
          aud: payload.aud,
          nbf: nbfDate?.toISOString() || 'not set'
        });
        
        // Log the full Authorization header
        console.log('Authorization header:', config.headers.Authorization);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.warn('No token found in AsyncStorage');
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
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      requestHeaders: response.config.headers
    });
    return response;
  },
  async (error) => {
    console.error('Response error:', {
      url: error.config?.url,
      fullUrl: error.config ? `${error.config.baseURL}${error.config.url}` : 'unknown',
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      requestHeaders: error.config?.headers,
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
    } else if (error.response.status === 401) {
      console.log('Unauthorized access, removing token');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userId');
    } else if (error.response.status === 404) {
      console.error('Endpoint not found:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient; 