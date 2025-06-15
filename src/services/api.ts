import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://novademy-api.azurewebsites.net/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error getting token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Clear tokens and redirect to login
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          throw new Error('No refresh token available');
        }

        // Make sure to use the full URL for the refresh token request
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { 
          token: refreshToken 
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 errors
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
      // Check if we have a valid token
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        // If no token, redirect to login
        return Promise.reject(new Error('Please login to access this resource'));
      }
      // If we have a token but still getting 403, it's a permissions issue
      return Promise.reject(new Error('You do not have permission to access this resource'));
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: FormData) => api.post('/auth/register', data),
  login: (data: FormData) => api.post('/auth/login', data),
  verifyEmail: (data: { userId: string; code: string }) => 
    api.post('/auth/verify-email', data),
  refresh: (data: { refreshToken: string }) => 
    api.post('/auth/refresh', data),
  logout: (userId: string) => 
    api.post(`/auth/logout/${userId}`),
  getCurrentUser: () => 
    api.get('/auth/me'),
};

export const userApi = {
  getUsers: () => api.get('/user'),
  getUser: (id: string) => api.get(`/user/${id}`),
  updateUser: (id: string, data: any) => api.put(`/user/${id}`, data),
  deleteUser: (id: string) => api.delete(`/user/${id}`),
};

export const courseApi = {
  getCourses: () => api.get('/course'),
  getCourse: (id: string) => api.get(`/course/${id}`),
  createCourse: (data: any) => api.post('/course', data),
  updateCourse: (id: string, data: any) => api.put(`/course/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/course/${id}`),
};

export const lessonApi = {
  getLessons: async (courseId: string) => {
    try {
      // Format the course ID to match the backend format
      const formattedCourseId = courseId.toLowerCase().trim();
      console.log('Fetching lessons for course:', formattedCourseId);
      const response = await api.get(`/lesson/course/${formattedCourseId}`);
      console.log('Lessons response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  },
  getLesson: (id: string) => api.get(`/lesson/${id}`),
  createLesson: (data: any) => api.post('/lesson', data),
  updateLesson: (id: string, data: any) => api.put(`/lesson/${id}`, data),
  deleteLesson: (id: string) => api.delete(`/lesson/${id}`),
};

export const packageApi = {
  getPackages: () => api.get('/package'),
  getPackage: (id: string) => api.get(`/package/${id}`),
  createPackage: (data: any) => api.post('/package', data),
  updatePackage: (id: string, data: any) => api.put(`/package/${id}`, data),
  deletePackage: (id: string) => api.delete(`/package/${id}`),
  isPackagePurchased: async (packageId: string) => {
    try {
      const response = await api.get(`/subscription/active/${packageId}`);
      return response.data.length > 0;
    } catch (error) {
      console.error('Error checking package purchase status:', error);
      return false;
    }
  }
};

export const subscriptionApi = {
  getActiveSubscriptions: async (userId: string) => {
    try {
      // Format the user ID to match the backend format
      const formattedUserId = userId.toLowerCase().trim();
      console.log('Formatted user ID:', formattedUserId);
      const response = await api.get(`/subscription/active/${formattedUserId}`);
      console.log('Subscription response:', response);
      return response;
    } catch (error) {
      console.error('Error in getActiveSubscriptions:', error);
      throw error;
    }
  },
  subscribe: async (data: { packageId: string; userId: string }) => {
    try {
      // Format the IDs to match the backend format
      const formattedUserId = data.userId.toLowerCase().trim();
      const formattedPackageId = data.packageId.toLowerCase().trim();
      console.log('Formatted IDs:', { userId: formattedUserId, packageId: formattedPackageId });
      const response = await api.post('/subscription', {
        userId: formattedUserId,
        packageId: formattedPackageId
      });
      console.log('Subscribe response:', response);
      return response;
    } catch (error) {
      console.error('Error in subscribe:', error);
      throw error;
    }
  }
};

export const openAiApi = {
  ask: (data: any) => api.post('/openai/ask', data),
};

export default api; 