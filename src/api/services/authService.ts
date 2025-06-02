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
  accessToken: string;
  refreshToken: string;
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
    await AsyncStorage.setItem('authToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
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

    try {
      console.log('Sending registration request with data:', {
        username: data.username,
        email: data.email,
        roleId: data.roleId,
        group: data.group,
        sector: data.sector,
        hasProfilePicture: !!data.profilePicture
      });

      const response = await apiClient.post<AuthResponse>('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Registration response:', {
        status: response.status,
        hasAccessToken: !!response.data?.accessToken,
        hasRefreshToken: !!response.data?.refreshToken
      });

      if (!response.data?.accessToken || !response.data?.refreshToken) {
        throw new Error('Invalid response from server: Missing tokens');
      }

      // Store the tokens
      await AsyncStorage.setItem('authToken', response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      
      return response.data;
    } catch (error: any) {
      console.error('Registration service error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      });
      throw error;
    }
  }

  async verifyEmail(userId: string, code: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { userId, code });
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
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