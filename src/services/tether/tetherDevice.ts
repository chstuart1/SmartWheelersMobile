import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import { DeviceType } from './tetherTypes';

const DEVICE_ID_KEY = 'smartwheelers_tether_device_id';
const DEVICE_TYPE_KEY = 'smartwheelers_tether_device_type';

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

export const getDeviceId = async (): Promise<string> => {
  const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (stored) {
    return stored;
  }
  const deviceId = createId();
  await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
};

export const detectDeviceType = async (): Promise<DeviceType> => {
  const forced = await AsyncStorage.getItem(DEVICE_TYPE_KEY);
  if (forced === 'pc' || forced === 'phone') {
    return forced;
  }
  const { width, height } = Dimensions.get('screen');
  const minSize = Math.min(width, height);
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return minSize <= 900 ? 'phone' : 'pc';
  }
  return 'pc';
};

export const setForcedDeviceType = async (type: DeviceType | null) => {
  if (!type) {
    await AsyncStorage.removeItem(DEVICE_TYPE_KEY);
    return;
  }
  await AsyncStorage.setItem(DEVICE_TYPE_KEY, type);
};
