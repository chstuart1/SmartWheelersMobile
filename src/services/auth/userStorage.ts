import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'smartwheelers_auth_user';

export const getStoredUser = async (): Promise<Record<string, any> | null> => {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredUser = async (user: Record<string, any> | null) => {
  try {
    if (!user) {
      await AsyncStorage.removeItem(USER_KEY);
      return;
    }
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Storage failures should not block auth flow
  }
};
