import { connectSocket, getSocket } from '../socket/socketClient';
import { DeviceType, PhotoReceivedData, TetherConnectionStatus, TetherRequestData } from './tetherTypes';
import { detectDeviceType, getDeviceId } from './tetherDevice';

const REGISTRATION_DEBOUNCE_MS = 2000;
let lastRegistrationTime = 0;
let isRegistering = false;
let registeredDeviceId: string | null = null;
let lastRegistrationPayload:
  | { userId: string; deviceId: string; deviceType: DeviceType; deviceName: string }
  | null = null;
let reconnectHandler: (() => void) | null = null;

const emitRegistration = (socket: ReturnType<typeof getSocket>, payload: {
  userId: string;
  deviceId: string;
  deviceType: DeviceType;
  deviceName: string;
}) => {
  if (!socket) return;
  const now = Date.now();
  if (isRegistering) {
    return;
  }
  if (now - lastRegistrationTime < REGISTRATION_DEBOUNCE_MS) {
    return;
  }
  isRegistering = true;
  socket.emit('tether:register-device', payload);
  lastRegistrationTime = Date.now();
  registeredDeviceId = payload.deviceId;
  isRegistering = false;
};

export const registerDevice = async (userId: string, deviceName?: string) => {
  const socket = await connectSocket();
  const deviceId = await getDeviceId();
  const deviceType = await detectDeviceType();

  if (registeredDeviceId === deviceId && socket.connected) {
    return;
  }

  const now = Date.now();
  if (isRegistering) {
    return;
  }
  if (now - lastRegistrationTime < REGISTRATION_DEBOUNCE_MS) {
    return;
  }

  const finalDeviceName = deviceName || (deviceType === 'pc' ? 'PC' : 'Phone');

  lastRegistrationPayload = {
    userId,
    deviceId,
    deviceType,
    deviceName: finalDeviceName,
  };

  if (reconnectHandler) {
    socket.off('connect', reconnectHandler);
  }
  reconnectHandler = () => {
    if (lastRegistrationPayload) {
      emitRegistration(socket, lastRegistrationPayload);
    }
  };
  socket.on('connect', reconnectHandler);

  if (!socket.connected) {
    return;
  }

  socket.once('disconnect', () => {
    registeredDeviceId = null;
  });

  emitRegistration(socket, {
    userId,
    deviceId,
    deviceType,
    deviceName: finalDeviceName,
  });
};

export const onTetherRequest = (callback: (data: TetherRequestData) => void) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('tether-request', callback);
  return () => socket.off('tether-request', callback);
};

export const onTetherAccepted = (
  callback: (data: {
    connectionId: string;
    pcDevice: { deviceId: string; deviceName: string };
    phoneDevice: { deviceId: string; deviceName: string };
  }) => void
) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('tether-accepted', callback);
  return () => socket.off('tether-accepted', callback);
};

export const onTetherRejected = (callback: (data: { requestId: string }) => void) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('tether-rejected', callback);
  return () => socket.off('tether-rejected', callback);
};

export const onTetherDisconnected = (callback: (data: { connectionId: string }) => void) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('tether-disconnected', callback);
  return () => socket.off('tether-disconnected', callback);
};

export const onPhotoReceived = (callback: (data: PhotoReceivedData) => void) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('photo-received', callback);
  return () => socket.off('photo-received', callback);
};

export const onPhotoUploadProgress = (
  callback: (data: {
    formSessionId: string;
    photoId: string;
    progress: number;
    fieldName: 'front_image' | 'back_image';
  }) => void
) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('photo-upload-progress', callback);
  return () => socket.off('photo-upload-progress', callback);
};

export const onConnectionStatus = (callback: (status: TetherConnectionStatus) => void) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('connection-status', callback);
  return () => socket.off('connection-status', callback);
};

export const onFindMyPhone = (callback: (data: { fromDeviceId: string; timestamp?: string }) => void) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('tether:find-my-phone', callback);
  return () => socket.off('tether:find-my-phone', callback);
};

export const onPhoneFound = (callback: (data: { phoneDeviceId: string; phoneDeviceName: string }) => void) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('tether:phone-found', callback);
  return () => socket.off('tether:phone-found', callback);
};

export const onOpenSmartCrop = (
  callback: (data: { formSessionId: string; fromDeviceId: string; timestamp?: string }) => void
) => {
  const socket = getSocket();
  if (!socket) return () => {};
  socket.on('tether:open-smart-crop', callback);
  return () => socket.off('tether:open-smart-crop', callback);
};

export const emitJoinFormSession = (formSessionId: string) => {
  const socket = getSocket();
  if (!socket) return;
  socket.emit('tether:join-form-session', { formSessionId });
};

export const emitPhoneFound = (payload: { fromDeviceId: string; phoneDeviceId: string; phoneDeviceName?: string }) => {
  const socket = getSocket();
  if (!socket) return;
  socket.emit('tether:phone-found', payload);
};
