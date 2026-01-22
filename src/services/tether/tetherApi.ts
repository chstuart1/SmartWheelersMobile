import { apiRequest } from '../api/apiClient';
import { ApiEndpoints } from '../api/endpoints';

export type InitiateTetherRequest = {
  deviceType: 'pc' | 'phone';
  deviceId: string;
  deviceName?: string;
  toDeviceId: string;
  formSessionId?: string;
  formType?: 'add-car' | 'edit-car' | string;
};

export const TetherApi = {
  initiate: (data: InitiateTetherRequest) =>
    apiRequest(ApiEndpoints.tether.initiate, { method: 'POST', body: data }),
  accept: (data: { requestId: string }) =>
    apiRequest(ApiEndpoints.tether.accept, { method: 'POST', body: data }),
  reject: (data: { requestId: string }) =>
    apiRequest(ApiEndpoints.tether.reject, { method: 'POST', body: data }),
  disconnect: (data: { connectionId: string }) =>
    apiRequest(ApiEndpoints.tether.disconnect, { method: 'POST', body: data }),
  status: (deviceId: string) =>
    apiRequest(`${ApiEndpoints.tether.status}?deviceId=${encodeURIComponent(deviceId)}`, {
      method: 'GET',
      timeoutMs: 15000,
    }),
  uploadPhoto: (formSessionId: string, fieldName: 'front_image' | 'back_image', image: any) => {
    const body = new FormData();
    body.append('formSessionId', formSessionId);
    body.append('fieldName', fieldName);
    body.append('image', image);
    return apiRequest(ApiEndpoints.tether.uploadPhoto, { method: 'POST', body, timeoutMs: 60000 });
  },
  pendingPhotos: (formSessionId: string) =>
    apiRequest(`${ApiEndpoints.tether.pendingPhotos}?formSessionId=${encodeURIComponent(formSessionId)}`, {
      method: 'GET',
      timeoutMs: 15000,
    }),
  activeDevices: (deviceType?: 'pc' | 'phone') => {
    const query = deviceType ? `?deviceType=${deviceType}` : '';
    return apiRequest(`${ApiEndpoints.tether.activeDevices}${query}`, { method: 'GET' });
  },
  findMyPhone: (deviceId: string) =>
    apiRequest(ApiEndpoints.tether.findMyPhone, { method: 'POST', body: { deviceId } }),
};
