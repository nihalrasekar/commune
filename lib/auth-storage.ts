import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@property_app_auth_token';
const USER_DATA_KEY = '@property_app_user_data';

export interface StoredUserData {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  flat_number: string;
  apartment_id: string;
}

// Token management
export const saveAuthToken = async (token: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    console.log('Auth token saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving auth token:', error);
    return false;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    console.log('Retrieved auth token:', token ? 'Token exists' : 'No token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const removeAuthToken = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    console.log('Auth token removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing auth token:', error);
    return false;
  }
};

// User data management
export const saveUserData = async (userData: StoredUserData): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    console.log('User data saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

export const getUserData = async (): Promise<StoredUserData | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    if (userData) {
      const parsed = JSON.parse(userData);
      console.log('Retrieved user data for:', parsed.email);
      return parsed;
    }
    console.log('No user data found');
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const removeUserData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
    console.log('User data removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing user data:', error);
    return false;
  }
};

// Clear all auth data
export const clearAllAuthData = async (): Promise<boolean> => {
  try {
    await Promise.all([
      removeAuthToken(),
      removeUserData()
    ]);
    console.log('All auth data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    const userData = await getUserData();
    const authenticated = !!(token && userData);
    console.log('Authentication check:', authenticated ? 'Authenticated' : 'Not authenticated');
    return authenticated;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};