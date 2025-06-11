import AsyncStorage from '@react-native-async-storage/async-storage';

interface DecodedToken {
  id: string;
  sub: string;
  role: string;
  exp: number;
  iat: number;
  iss: string;
  aud: string;
  nbf: number;
}

export const decodeToken = async (): Promise<DecodedToken | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      return null;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload as DecodedToken;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isTokenExpired = async (): Promise<boolean> => {
  try {
    const decoded = await decodeToken();
    if (!decoded) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

export const getUserId = async (): Promise<string | null> => {
  try {
    const decoded = await decodeToken();
    return decoded?.id || null;
  } catch (error) {
    console.error('Error getting user ID from token:', error);
    return null;
  }
};

export const getUserRole = async (): Promise<string | null> => {
  try {
    const decoded = await decodeToken();
    return decoded?.role || null;
  } catch (error) {
    console.error('Error getting user role from token:', error);
    return null;
  }
}; 