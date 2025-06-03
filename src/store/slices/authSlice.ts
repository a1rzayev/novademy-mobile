import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../api/client';
import authService from '../../api/services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  token: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login({
        username: credentials.email,
        password: credentials.password
      });
      
      // Get user info after successful login
      const user = await authService.getCurrentUser();
      
      return { 
        token: response.accessToken,
        user: user || {
          id: '',
          email: credentials.email,
          name: '',
          isVerified: false
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; name: string }, { rejectWithValue }) => {
    try {
      const response = await authService.register({
        username: userData.email,
        password: userData.password,
        email: userData.email,
        firstName: userData.name.split(' ')[0],
        lastName: userData.name.split(' ')[1] || '',
        phoneNumber: '',
        roleId: 2, // Default role for regular users
        sector: 1, // Default sector
      });
      
      return response;
    } catch (error: any) {
      console.error('Register error:', error);
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ userId, code }: { userId: string; code: string }, { rejectWithValue }) => {
    try {
      console.log('Verifying email with:', { userId, code });
      
      // Ensure userId is a valid GUID format
      let formattedUserId: string;
      try {
        // Try to parse and format as GUID
        formattedUserId = userId.toLowerCase().trim();
        // Validate GUID format
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(formattedUserId)) {
          throw new Error('Invalid GUID format');
        }
      } catch (error) {
        console.error('Invalid userId format:', error);
        return rejectWithValue('Invalid user ID format');
      }

      // Ensure code is a 4-digit string
      const cleanCode = code.replace(/\D/g, '');
      if (cleanCode.length !== 4 || !/^\d{4}$/.test(cleanCode)) {
        return rejectWithValue('Invalid verification code format');
      }
      
      const response = await apiClient.post('/auth/verify-email', {
        userId: formattedUserId,
        code: cleanCode
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Verify email error:', error);
      if (error.response?.data?.errors) {
        // Format the error messages to be more user-friendly
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => {
            if (field === '$.userId') {
              return 'Invalid user ID format';
            }
            if (field === 'request') {
              return 'Invalid verification request';
            }
            if (field === 'code') {
              return 'Invalid verification code format';
            }
            return `${field}: ${(messages as string[]).join(', ')}`;
          })
          .join('\n');
        return rejectWithValue(errorMessages);
      }
      return rejectWithValue(error.response?.data?.message || 'Email verification failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        if (state.user) {
          state.user.isVerified = true;
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer; 