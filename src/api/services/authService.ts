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
  group: number;
  sector: SectorType;
  profilePicture?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  id: string;
  message: string;
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

  async register(data: RegisterData): Promise<RegisterResponse> {
    const formData = new FormData();
    
    // Match exact casing with backend model
    formData.append('Username', data.username.trim());
    formData.append('Password', data.password);
    formData.append('FirstName', data.firstName.trim());
    formData.append('LastName', data.lastName.trim());
    formData.append('Email', data.email.trim().toLowerCase());
    formData.append('PhoneNumber', data.phoneNumber.trim());
    formData.append('RoleId', data.roleId.toString());
    formData.append('Group', data.group.toString());
    formData.append('Sector', data.sector.toString());

    // Append profile picture if exists
    if (data.profilePicture) {
      const filename = data.profilePicture.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('ProfilePicture', {
        uri: data.profilePicture,
        type,
        name: filename,
      } as any);
    }

    try {
      console.log('Sending registration request with data:', {
        username: data.username,
        email: data.email,
        roleId: data.roleId,
        group: data.group,
        sector: data.sector,
        hasProfilePicture: !!data.profilePicture,
        formDataKeys: Array.from(formData.keys())
      });

      const response = await apiClient.post<RegisterResponse>('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data, headers) => {
          // Don't transform FormData
          return data;
        },
      });

      console.log('Registration response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      // The backend returns a 201 Created with the user ID in the response body
      if (response.status === 201) {
        // Extract the user ID from the response
        const userId = response.data?.id || response.headers?.location?.split('/').pop();
        if (!userId) {
          throw new Error('Could not find user ID in response');
        }
        return {
          id: userId,
          message: response.data?.message || 'Registration successful'
        };
      }

      throw new Error('Unexpected response status: ' + response.status);
    } catch (error: any) {
      console.error('Registration service error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
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