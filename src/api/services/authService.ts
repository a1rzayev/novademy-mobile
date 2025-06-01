import apiClient from '../client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleId: string;
  group: string;
  sector: string;
  profilePicture?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    roleId: string;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post<AuthResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    await AsyncStorage.setItem('authToken', response.data.token);
    return response.data;
  }

  async register(data: RegisterData): Promise<{ userId: string }> {
    const formData = new FormData();
    
    // Append all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'profilePicture') {
        formData.append(key, value);
      }
    });

    // Append profile picture if exists
    if (data.profilePicture) {
      formData.append('profilePicture', {
        uri: data.profilePicture,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);
    }

    const response = await apiClient.post<{ userId: string }>('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async verifyEmail(userId: string, code: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { userId, code });
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  }

  async getCurrentUser(): Promise<AuthResponse['user'] | null> {
    try {
      const response = await apiClient.get<AuthResponse['user']>('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService(); 