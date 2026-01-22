import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '../../app/config/appConfig';
import { getAuthToken } from '../auth/tokenStorage';

let socketInstance: Socket | null = null;

export const connectSocket = async (env?: 'development' | 'production') => {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  const token = await getAuthToken();
  const socketUrl = getSocketUrl(env);

  socketInstance = io(socketUrl, {
    transports: ['polling', 'websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    auth: token ? { token } : undefined,
  });

  socketInstance.on('connect', () => {
    console.log('[INFO] [Socket] Connected', { socketId: socketInstance?.id });
  });

  socketInstance.on('disconnect', () => {
    console.log('[WARN] [Socket] Disconnected');
  });

  socketInstance.on('connect_error', (error) => {
    console.error('[ERROR] [Socket] Connection error', error);
  });

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
