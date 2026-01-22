import { Platform } from 'react-native';

type Environment = 'development' | 'staging' | 'production';

const getEnvironment = (): Environment => {
  if (__DEV__) {
    return 'development';
  }
  // In production, you can check for staging environment variables
  // For now, default to production
  return 'production';
};

const ENV = getEnvironment();

// Environment variable support
// In React Native, we can't use process.env directly without additional setup
// This provides a type-safe way to access environment-specific values
export const AppConfig = {
  environment: ENV,
  isDevelopment: ENV === 'development',
  isProduction: ENV === 'production',
  isStaging: ENV === 'staging',

  // API Configuration
  api: {
    baseUrl:
      ENV === 'development'
        ? Platform.select({
            ios: 'http://localhost:5003',
            android: 'http://10.0.2.2:5003',
            default: 'http://localhost:5003',
          }) || 'https://server.smartwheelers.com'
        : 'https://server.smartwheelers.com',
    timeout: 30000,
  },

  // Socket Configuration
  socket: {
    baseUrl:
      ENV === 'development'
        ? Platform.select({
            ios: 'http://localhost:5009',
            android: 'http://10.0.2.2:5009',
            default: 'http://localhost:5009',
          }) || 'https://server.smartwheelers.com'
        : 'https://server.smartwheelers.com',
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  },

  // Feature Flags
  features: {
    enableAnalytics: true,
    enableRecaptcha: !__DEV__,
    enableOfflineRetry: true,
    maxRetryAttempts: 3,
    retryDelayMs: 1000,
  },
} as const;

// Helper to get config value with fallback
export const getConfig = <T>(path: string, fallback?: T): T => {
  const keys = path.split('.');
  let value: any = AppConfig;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      return fallback as T;
    }
  }
  return value as T;
};
