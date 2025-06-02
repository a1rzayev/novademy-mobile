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

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roleId: number;
  role: string;
  group: number;
  sector: SectorType;
  profilePictureUrl?: string;
  isEmailVerified: boolean;
  registeredAt: string;
  lastLoginAt: string;
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

    // Store tokens
    await AsyncStorage.setItem('authToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);

    // Extract and store user ID from JWT token
    try {
      const tokenPayload = JSON.parse(atob(response.data.accessToken.split('.')[1]));
      if (tokenPayload.id) {
        await AsyncStorage.setItem('userId', tokenPayload.id);
      }
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
    }

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

      // Log the complete response for debugging
      console.log('Complete registration response:', {
        status: response.status,
        statusText: response.statusText,
        headers: JSON.stringify(response.headers, null, 2),
        data: JSON.stringify(response.data, null, 2),
        config: JSON.stringify(response.config, null, 2)
      });

      // The backend returns a 201 Created with the user ID in the response body
      if (response.status === 201) {
        // Try to get the user ID from different possible locations
        let userId: string | undefined;

        // 1. Try from response data
        if (response.data?.id) {
          userId = response.data.id;
          console.log('Found userId in response.data.id:', userId);
        }
        // 2. Try from location header
        else if (response.headers?.location) {
          // First try to get it from the query parameter
          const url = new URL(response.headers.location, 'http://dummy');
          const idParam = url.searchParams.get('id');
          if (idParam) {
            userId = idParam;
            console.log('Found userId in location query param:', userId);
          } else {
            // If not in query param, try to extract GUID from the path
            const locationMatch = response.headers.location.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (locationMatch) {
              userId = locationMatch[0];
              console.log('Extracted userId from location path:', userId);
            } else {
              console.log('Location header format:', response.headers.location);
            }
          }
        }
        // 3. Try from response message
        else if (typeof response.data === 'string' && response.data.includes('User with ID')) {
          const match = response.data.match(/User with ID ([^ ]+)/);
          if (match) {
            userId = match[1];
            console.log('Found userId in response message:', userId);
          }
        }

        if (!userId) {
          console.error('Could not find userId in response:', {
            headers: response.headers,
            data: response.data
          });
          throw new Error('Could not find user ID in registration response');
        }

        // Clean up the userId
        userId = userId.trim().toLowerCase();

        // If it's a number, convert to GUID format
        if (/^\d+$/.test(userId)) {
          const padded = userId.padStart(32, '0');
          userId = [
            padded.slice(0, 8),
            padded.slice(8, 12),
            padded.slice(12, 16),
            padded.slice(16, 20),
            padded.slice(20, 32)
          ].join('-');
          console.log('Converted numeric userId to GUID format:', userId);
        }

        // Validate the final userId format
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
          console.error('Invalid userId format after processing:', {
            userId,
            originalLocation: response.headers?.location,
            originalData: response.data
          });
          throw new Error('Invalid user ID format after processing');
        }

        console.log('Final processed userId:', userId);

        return {
          id: userId,
          message: typeof response.data === 'string' ? response.data : 'Registration successful'
        };
      }

      throw new Error(`Unexpected response status: ${response.status}`);
    } catch (error: any) {
      // Enhanced error logging
      console.error('Registration service error details:', {
        message: error.message,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        },
        request: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        }
      });

      // Rethrow with a more descriptive message
      if (error.response?.data) {
        throw new Error(typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data));
      }
      throw error;
    }
  }

  async verifyEmail(userId: string, code: string): Promise<void> {
    // Ensure userId is a valid GUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      console.error('Invalid userId format in verifyEmail:', userId);
      throw new Error('Invalid user ID format. Expected a valid GUID.');
    }

    // Ensure code is exactly 4 digits
    const cleanCode = code.replace(/\D/g, '');
    if (!/^\d{4}$/.test(cleanCode)) {
      console.error('Invalid code format in verifyEmail:', code);
      throw new Error('Invalid verification code format. Expected exactly 4 digits.');
    }

    try {
      console.log('Sending verification request:', {
        userId,
        code: cleanCode,
        endpoint: '/auth/verify-email'
      });

      const response = await apiClient.post('/auth/verify-email', {
        userId: userId.toLowerCase(),
        code: cleanCode
      });

      console.log('Verification response:', response.data);
    } catch (error: any) {
      console.error('Verification error details:', {
        message: error.message,
        response: {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        },
        request: {
          userId,
          code: cleanCode
        }
      });

      if (error.response?.data) {
        // Handle specific error messages from the API
        const errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || JSON.stringify(error.response.data);

        if (errorMessage.includes('Invalid verification code')) {
          throw new Error('The verification code is incorrect. Please check your email and try again.');
        } else if (errorMessage.includes('expired')) {
          throw new Error('The verification code has expired. Please request a new one.');
        } else if (errorMessage.includes('already verified')) {
          throw new Error('This email is already verified. You can now login.');
        }

        throw new Error(errorMessage);
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.warn('No user ID found in storage');
        return;
      }
      await apiClient.post(`/auth/logout/${userId}`);
    } finally {
      // Clear all auth-related data
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userId']);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken
    });
    await AsyncStorage.setItem('authToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching current user:', {
        message: error.message,
        response: {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        }
      });
      
      // If the user is not authenticated (401) or the endpoint is not found (404),
      // return null to indicate no user is logged in
      if (error.response?.status === 401 || error.response?.status === 404) {
        return null;
      }
      
      // For other errors, throw to let the caller handle them
      throw error;
    }
  }
}

export default new AuthService(); 