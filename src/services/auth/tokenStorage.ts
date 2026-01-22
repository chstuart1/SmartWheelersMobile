import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'smartwheelers_auth_token';

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(TOKEN_KEY);
    return value && value.trim().length > 0 ? value : null;
  } catch {
    return null;
  }
};

export const setAuthToken = async (token: string | null) => {
  try {
    if (!token || token.trim().length === 0) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      return;
    }
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage failures should not break auth flow
  }
};
