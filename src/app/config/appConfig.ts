import { AppConfig } from './env';

export const getApiBaseUrl = (env?: 'development' | 'production') => {
  if (env === 'development' || AppConfig.isDevelopment) {
    return AppConfig.api.baseUrl;
  }
  return AppConfig.api.baseUrl;
};

export const getSocketUrl = (env?: 'development' | 'production') => {
  if (env === 'development' || AppConfig.isDevelopment) {
    return AppConfig.socket.baseUrl;
  }
  return AppConfig.socket.baseUrl;
};
