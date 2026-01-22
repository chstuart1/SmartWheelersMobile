export type DeviceType = 'pc' | 'phone';

export type TetherRequestData = {
  requestId: string;
  fromDevice: {
    deviceId: string;
    deviceName: string;
    deviceType: DeviceType;
  };
  toDeviceId: string;
  formSessionId?: string;
};

export type TetherConnectionStatus = {
  isConnected: boolean;
  connectionId?: string;
  otherDevice?: {
    deviceId: string;
    deviceName: string;
    deviceType: DeviceType;
  };
  connectedAt?: string;
  photosUploaded?: number;
};

export type PhotoReceivedData = {
  formSessionId: string;
  photoId: string;
  imageUrl: string;
  fieldName: 'front_image' | 'back_image';
};
