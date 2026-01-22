import analytics from '@react-native-firebase/analytics';

let initialized = false;

export const initializeAnalytics = async () => {
  if (initialized) {
    return;
  }
  initialized = true;
  await analytics().setAnalyticsCollectionEnabled(true);
};

export const trackScreen = async (screenName: string, screenClass?: string) => {
  if (!screenName) {
    return;
  }
  await initializeAnalytics();
  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenClass || screenName,
  });
};

export const trackEvent = async (eventName: string, params?: Record<string, any>) => {
  if (!eventName) {
    return;
  }
  await initializeAnalytics();
  await analytics().logEvent(eventName, params);
};

export const setAnalyticsUserId = async (userId?: string | null) => {
  await initializeAnalytics();
  await analytics().setUserId(userId || null);
};

export const setAnalyticsUserProperties = async (properties: Record<string, string | null>) => {
  await initializeAnalytics();
  await analytics().setUserProperties(properties);
};
