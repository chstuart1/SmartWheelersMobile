// Jest setup file for React Native
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

// Mock other native modules
jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: () => ({
    setAnalyticsCollectionEnabled: jest.fn(),
    logScreenView: jest.fn(),
    logEvent: jest.fn(),
    setUserId: jest.fn(),
    setUserProperties: jest.fn(),
  }),
}));

jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    addEventListener: jest.fn(() => jest.fn()), // Return unsubscribe function
  },
}));

jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

jest.mock('react-native-webview', () => ({
  __esModule: true,
  default: jest.fn(() => null),
  WebView: jest.fn(() => null),
}));
