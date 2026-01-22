import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TetherApi } from '../../services/tether/tetherApi';
import { detectDeviceType, getDeviceId } from '../../services/tether/tetherDevice';
import {
  emitJoinFormSession,
  emitPhoneFound,
  onConnectionStatus,
  onFindMyPhone,
  onOpenSmartCrop,
  onPhotoReceived,
  onTetherAccepted,
  onTetherDisconnected,
  onTetherRejected,
  onTetherRequest,
  registerDevice,
} from '../../services/tether/tetherSocket';
import { PhotoReceivedData, TetherConnectionStatus, TetherRequestData } from '../../services/tether/tetherTypes';

export const useTether = () => {
  const { user } = useAuth();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<'pc' | 'phone' | null>(null);
  const [status, setStatus] = useState<TetherConnectionStatus | null>(null);
  const [pendingRequest, setPendingRequest] = useState<TetherRequestData | null>(null);
  const [lastPhoto, setLastPhoto] = useState<PhotoReceivedData | null>(null);
  const [incomingFormSessionId, setIncomingFormSessionId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const id = await getDeviceId();
      const type = await detectDeviceType();
      setDeviceId(id);
      setDeviceType(type);
      if (user?.id) {
        await registerDevice(user.id);
      }
    };
    init();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const cleanupRequest = onTetherRequest((data) => setPendingRequest(data));
    const cleanupAccepted = onTetherAccepted(() => {
      setPendingRequest(null);
    });
    const cleanupRejected = onTetherRejected(() => {
      setPendingRequest(null);
    });
    const cleanupDisconnected = onTetherDisconnected(() => {
      setStatus(null);
    });
    const cleanupStatus = onConnectionStatus((data) => {
      setStatus(data);
    });
    const cleanupPhoto = onPhotoReceived((data) => {
      setLastPhoto(data);
    });
    const cleanupFindMyPhone = onFindMyPhone(async (data) => {
      if (deviceType !== 'phone' || !deviceId || !data?.fromDeviceId) {
        return;
      }
      emitPhoneFound({
        fromDeviceId: data.fromDeviceId,
        phoneDeviceId: deviceId,
        phoneDeviceName: 'Phone',
      });
    });
    const cleanupOpenSmartCrop = onOpenSmartCrop((data) => {
      if (data?.formSessionId) {
        setIncomingFormSessionId(data.formSessionId);
      }
    });

    return () => {
      cleanupRequest();
      cleanupAccepted();
      cleanupRejected();
      cleanupDisconnected();
      cleanupStatus();
      cleanupPhoto();
      cleanupFindMyPhone();
      cleanupOpenSmartCrop();
    };
  }, [user?.id, deviceId, deviceType]);

  const checkStatus = useCallback(async () => {
    if (!deviceId) return;
    const response = await TetherApi.status(deviceId);
    const payload = (response as any)?.data || response;
    if (payload?.success) {
      setStatus({
        isConnected: payload.isConnected,
        connectionId: payload.connectionId,
        otherDevice: payload.otherDevice,
        connectedAt: payload.connectedAt,
        photosUploaded: payload.photosUploaded,
      });
      if (payload.formSessionId) {
        emitJoinFormSession(payload.formSessionId);
        setIncomingFormSessionId(payload.formSessionId);
      }
    }
  }, [deviceId]);

  return {
    deviceId,
    deviceType,
    status,
    pendingRequest,
    lastPhoto,
    incomingFormSessionId,
    checkStatus,
  };
};
