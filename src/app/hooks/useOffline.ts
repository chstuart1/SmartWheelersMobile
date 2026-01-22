import { useNetworkStatus } from '../../services/network/networkMonitor';

export const useOffline = () => {
  const isConnected = useNetworkStatus();
  return !isConnected;
};
