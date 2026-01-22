import { useEffect, useState } from 'react';

// Lazy load NetInfo to avoid issues if package is not installed
let NetInfo: any = null;
let networkState: { isConnected: boolean } | null = null;
const listeners = new Set<(isConnected: boolean) => void>();

try {
  NetInfo = require('@react-native-community/netinfo');
} catch {
  console.warn('[WARN] [NetworkMonitor] @react-native-community/netinfo not installed. Network monitoring disabled.');
}

const updateNetworkState = (state: { isConnected: boolean }) => {
  networkState = state;
  const isConnected = state.isConnected ?? false;
  listeners.forEach((listener) => listener(isConnected));
};

// Initialize network monitoring if available
if (NetInfo) {
  NetInfo.fetch().then(updateNetworkState);
  NetInfo.addEventListener(updateNetworkState);
} else {
  // Default to assuming network is available if package is not installed
  networkState = { isConnected: true };
}

export const isNetworkAvailable = (): boolean => {
  return networkState?.isConnected ?? false;
};

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    return networkState?.isConnected ?? false;
  });

  useEffect(() => {
    const listener = (connected: boolean) => {
      setIsConnected(connected);
    };
    listeners.add(listener);
    setIsConnected(networkState?.isConnected ?? false);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return isConnected;
};
