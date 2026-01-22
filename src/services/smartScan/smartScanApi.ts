import { apiRequest } from '../api/apiClient';
import { ApiEndpoints } from '../api/endpoints';

const buildImageFormData = (front: { uri: string; type: string; name: string }, back: { uri: string; type: string; name: string }, scanSessionId?: string) => {
  const body = new FormData();
  body.append('front_image', front as any);
  body.append('back_image', back as any);
  if (scanSessionId) {
    body.append('scan_session_id', scanSessionId);
  }
  return body;
};

const buildQuickCropFormData = (image: { uri: string; type: string; name: string }, imageType: 'front' | 'back', scanSessionId?: string) => {
  const body = new FormData();
  body.append('image', image as any);
  body.append('image_type', imageType);
  if (scanSessionId) {
    body.append('scan_session_id', scanSessionId);
  }
  return body;
};

export const SmartScanApi = {
  processImages: (front: { uri: string; type: string; name: string }, back: { uri: string; type: string; name: string }, scanSessionId?: string) =>
    apiRequest(ApiEndpoints.smartScan.process, {
      method: 'POST',
      body: buildImageFormData(front, back, scanSessionId),
      timeoutMs: 60000,
    }),
  quickCrop: (image: { uri: string; type: string; name: string }, imageType: 'front' | 'back', scanSessionId?: string) =>
    apiRequest(ApiEndpoints.smartScan.quickCrop, {
      method: 'POST',
      body: buildQuickCropFormData(image, imageType, scanSessionId),
      timeoutMs: 30000,
    }),
};
