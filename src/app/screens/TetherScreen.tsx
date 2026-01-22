import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTether } from '../hooks/useTether';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { TetherApi } from '../../services/tether/tetherApi';

type Props = {
  onBack: () => void;
};

export const TetherScreen = ({ onBack }: Props) => {
  const { deviceId, deviceType, status, pendingRequest, lastPhoto, checkStatus, incomingFormSessionId } = useTether();
  useScreenTracking('Tether');
  const [isHandlingRequest, setIsHandlingRequest] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<
    Array<{ deviceId: string; deviceType: 'pc' | 'phone'; deviceName?: string }>
  >([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [formSessionId, setFormSessionId] = useState('');
  const [initiateMessage, setInitiateMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formSessionId && incomingFormSessionId) {
      setFormSessionId(incomingFormSessionId);
    }
  }, [formSessionId, incomingFormSessionId]);

  const handleAccept = async () => {
    if (!pendingRequest) return;
    setIsHandlingRequest(true);
    setError(null);
    try {
      await TetherApi.accept({ requestId: pendingRequest.requestId });
    } catch (err: any) {
      setError(err?.message || 'Failed to accept request');
    } finally {
      setIsHandlingRequest(false);
    }
  };

  const handleReject = async () => {
    if (!pendingRequest) return;
    setIsHandlingRequest(true);
    setError(null);
    try {
      await TetherApi.reject({ requestId: pendingRequest.requestId });
    } catch (err: any) {
      setError(err?.message || 'Failed to reject request');
    } finally {
      setIsHandlingRequest(false);
    }
  };

  const loadActiveDevices = async () => {
    setIsLoadingDevices(true);
    setError(null);
    try {
      const response = await TetherApi.activeDevices('pc');
      const payload = (response as any)?.data || response;
      if (payload?.success) {
        const devices = Array.isArray(payload.devices) ? payload.devices : [];
        setAvailableDevices(devices);
        if (devices.length === 1) {
          setSelectedDeviceId(devices[0].deviceId);
        }
      } else {
        setAvailableDevices([]);
        setError(payload?.error || 'Failed to load devices');
      }
    } catch (err: any) {
      setAvailableDevices([]);
      setError(err?.message || 'Failed to load devices');
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const handleInitiate = async () => {
    if (!deviceId || !deviceType) {
      setError('Device registration not ready yet.');
      return;
    }
    if (!selectedDeviceId) {
      setError('Select a PC device to connect.');
      return;
    }
    setIsInitiating(true);
    setError(null);
    setInitiateMessage(null);
    try {
      const response = await TetherApi.initiate({
        deviceType,
        deviceId,
        toDeviceId: selectedDeviceId,
        formSessionId: formSessionId || undefined,
      });
      const payload = (response as any)?.data || response;
      if (payload?.success) {
        setInitiateMessage('Connection request sent.');
      } else {
        setError(payload?.error || 'Failed to initiate connection');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate connection');
    } finally {
      setIsInitiating(false);
    }
  };

  const handleDisconnect = async () => {
    if (!status?.connectionId) return;
    setIsDisconnecting(true);
    setError(null);
    try {
      await TetherApi.disconnect({ connectionId: status.connectionId });
    } catch (err: any) {
      setError(err?.message || 'Failed to disconnect');
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tether</Text>
      <Text style={styles.label}>Device ID</Text>
      <Text style={styles.value}>{deviceId || 'Loading...'}</Text>
      <Text style={styles.label}>Device Type</Text>
      <Text style={styles.value}>{deviceType || 'Loading...'}</Text>

      <Text style={styles.sectionTitle}>Connection Status</Text>
      <Text style={styles.value}>{status?.isConnected ? 'Connected' : 'Not connected'}</Text>
      {status?.otherDevice ? (
        <Text style={styles.value}>
          {status.otherDevice.deviceName} ({status.otherDevice.deviceType})
        </Text>
      ) : null}
      {status?.isConnected ? (
        <TouchableOpacity style={styles.secondaryButton} onPress={handleDisconnect} disabled={isDisconnecting}>
          {isDisconnecting ? (
            <ActivityIndicator color="#E2E8F0" />
          ) : (
            <Text style={styles.secondaryButtonText}>Disconnect</Text>
          )}
        </TouchableOpacity>
      ) : null}

      {pendingRequest ? (
        <View style={styles.requestBox}>
          <Text style={styles.warning}>Pending request received</Text>
          <Text style={styles.value}>
            From: {pendingRequest.fromDevice.deviceName} ({pendingRequest.fromDevice.deviceType})
          </Text>
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAccept}
              disabled={isHandlingRequest}
            >
              <Text style={styles.primaryButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleReject}
              disabled={isHandlingRequest}
            >
              <Text style={styles.secondaryButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {lastPhoto ? (
        <Text style={styles.value}>Last photo: {lastPhoto.fieldName}</Text>
      ) : null}

      {incomingFormSessionId ? (
        <Text style={styles.hint}>Smart Crop requested for session {incomingFormSessionId}</Text>
      ) : null}

      <Text style={styles.sectionTitle}>Connect to a PC</Text>
      <Text style={styles.label}>Form session ID (optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter form session id"
        placeholderTextColor="#64748B"
        value={formSessionId}
        onChangeText={setFormSessionId}
      />

      <View style={styles.deviceHeader}>
        <Text style={styles.label}>Active PCs</Text>
        <TouchableOpacity style={styles.inlineButton} onPress={loadActiveDevices} disabled={isLoadingDevices}>
          <Text style={styles.inlineButtonText}>{isLoadingDevices ? 'Loading...' : 'Refresh list'}</Text>
        </TouchableOpacity>
      </View>
      {availableDevices.length ? (
        <View style={styles.deviceList}>
          {availableDevices.map((device) => (
            <TouchableOpacity
              key={device.deviceId}
              style={[
                styles.deviceRow,
                selectedDeviceId === device.deviceId ? styles.deviceRowSelected : null,
              ]}
              onPress={() => setSelectedDeviceId(device.deviceId)}
            >
              <Text style={styles.value}>{device.deviceName || 'PC'} </Text>
              <Text style={styles.mutedText}>{device.deviceId}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.mutedText}>No active PCs found. Make sure the web app is open.</Text>
      )}

      <Text style={styles.label}>PC device ID (manual)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter PC device id"
        placeholderTextColor="#64748B"
        value={selectedDeviceId}
        onChangeText={setSelectedDeviceId}
      />

      {initiateMessage ? <Text style={styles.success}>{initiateMessage}</Text> : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleInitiate} disabled={isInitiating}>
        {isInitiating ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Request Connection</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={checkStatus}>
        <Text style={styles.buttonText}>Refresh Status</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 10,
  },
  mutedText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
  },
  value: {
    color: '#E2E8F0',
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#CBD5F5',
    fontSize: 14,
    marginTop: 16,
  },
  warning: {
    color: '#FBBF24',
    marginTop: 12,
  },
  error: {
    color: '#FCA5A5',
    marginTop: 12,
  },
  hint: {
    color: '#A7F3D0',
    fontSize: 12,
    marginTop: 8,
  },
  success: {
    color: '#86EFAC',
    marginTop: 12,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#111827',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 6,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  inlineButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inlineButtonText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  deviceList: {
    marginTop: 8,
    gap: 8,
  },
  deviceRow: {
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  deviceRowSelected: {
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  requestBox: {
    marginTop: 12,
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 10,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
