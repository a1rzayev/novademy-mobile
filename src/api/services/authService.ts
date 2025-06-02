import apiClient from '../client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  username: string;
  password: string;
}

export enum SectorType {
  Azerbaijani = 0,
  Russian = 1,
  English = 2
}

export interface RegisterData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleId: number;
  group?: number;
  sector: SectorType;
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
    
    // Append all text fields with proper casing to match API model
    formData.append('Username', data.username);
    formData.append('Password', data.password);
    formData.append('FirstName', data.firstName);
    formData.append('LastName', data.lastName);
    formData.append('Email', data.email);
    formData.append('PhoneNumber', data.phoneNumber);
    formData.append('RoleId', data.roleId.toString());
    if (data.group !== undefined) {
      formData.append('Group', data.group.toString());
    }
    formData.append('Sector', data.sector.toString());

    // Append profile picture if exists
    if (data.profilePicture) {
      formData.append('ProfilePicture', {
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