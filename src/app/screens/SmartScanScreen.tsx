import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { captureImage } from '../utils/imagePicker';
import { SmartScanApi } from '../../services/smartScan/smartScanApi';
import { SmartScanResult } from '../../services/smartScan/smartScanTypes';
import { useScreenTracking } from '../hooks/useScreenTracking';

type Props = {
  onBack: () => void;
};

type MatchItem = {
  car_id?: string;
  confidence?: number;
  car?: Record<string, any>;
};

export const SmartScanScreen = ({ onBack }: Props) => {
  useScreenTracking('SmartScan');
  const [frontImage, setFrontImage] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [backImage, setBackImage] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SmartScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [frontCropReady, setFrontCropReady] = useState(false);
  const [backCropReady, setBackCropReady] = useState(false);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const scanSessionId = useMemo(() => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, []);

  const handleCaptureFront = async () => {
    setError(null);
    const image = await captureImage('front');
    setFrontImage(image);
    try {
      const response = await SmartScanApi.quickCrop(image, 'front', scanSessionId);
      const payload = (response as any)?.data || response;
      const croppedImage = payload?.data?.cropped_image || payload?.cropped_image;
      setFrontPreview(normalizePreview(croppedImage));
      setFrontCropReady(true);
    } catch {
      setFrontCropReady(false);
    }
  };

  const handleCaptureBack = async () => {
    setError(null);
    const image = await captureImage('back');
    setBackImage(image);
    try {
      const response = await SmartScanApi.quickCrop(image, 'back', scanSessionId);
      const payload = (response as any)?.data || response;
      const croppedImage = payload?.data?.cropped_image || payload?.cropped_image;
      setBackPreview(normalizePreview(croppedImage));
      setBackCropReady(true);
    } catch {
      setBackCropReady(false);
    }
  };

  const handleProcess = async () => {
    if (!frontImage || !backImage) {
      setError('Front and back images are required.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const response = await SmartScanApi.processImages(frontImage, backImage, scanSessionId);
      const payload = (response as any)?.data || response;
      setResult(payload?.data || payload);
    } catch (err: any) {
      const payload = err?.payload;
      if (payload?.data) {
        setResult(payload.data);
      }
      setError(payload?.error || err?.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFrontImage(null);
    setBackImage(null);
    setResult(null);
    setError(null);
    setFrontCropReady(false);
    setBackCropReady(false);
    setFrontPreview(null);
    setBackPreview(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Smart Scan</Text>
      <Text style={styles.subtitle}>Capture front and back images</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Front image</Text>
        <TouchableOpacity style={styles.button} onPress={handleCaptureFront}>
          <Text style={styles.buttonText}>{frontImage ? 'Retake front' : 'Capture front'}</Text>
        </TouchableOpacity>
        {frontCropReady ? <Text style={styles.hint}>Quick crop ready</Text> : null}
        {frontPreview ? <Image source={{ uri: frontPreview }} style={styles.preview} /> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Back image</Text>
        <TouchableOpacity style={styles.button} onPress={handleCaptureBack}>
          <Text style={styles.buttonText}>{backImage ? 'Retake back' : 'Capture back'}</Text>
        </TouchableOpacity>
        {backCropReady ? <Text style={styles.hint}>Quick crop ready</Text> : null}
        {backPreview ? <Image source={{ uri: backPreview }} style={styles.preview} /> : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.primaryButton} onPress={handleProcess} disabled={isProcessing}>
        {isProcessing ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Process Scan</Text>}
      </TouchableOpacity>

      {isProcessing ? <Text style={styles.hint}>Processing scan. This can take a few seconds.</Text> : null}

      {result ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Result</Text>
          <Text style={styles.resultText}>Matches: {result.match_result?.matches?.length || 0}</Text>
          <Text style={styles.resultText}>Tier: {result.match_result?.confidence_tier || 'unknown'}</Text>
          {result.extracted_data?.model_number ? (
            <Text style={styles.resultText}>Model number: {String(result.extracted_data.model_number)}</Text>
          ) : null}
          {result.match_result?.matches?.length ? (
            <View style={styles.matchList}>
              {result.match_result.matches.slice(0, 3).map((match, index) => (
                <Text key={`${match.car_id}-${index}`} style={styles.resultText}>
                  {formatMatchLabel(match)} ({Math.round(match.confidence)}%)
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
          <Text style={styles.secondaryButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const normalizePreview = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith('data:image')) {
    return value;
  }
  return `data:image/jpeg;base64,${value}`;
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
    marginBottom: 6,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 16,
  },
  section: {
    marginTop: 12,
  },
  label: {
    color: '#CBD5F5',
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#1F2937',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resultBox: {
    marginTop: 20,
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 10,
  },
  resultTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  resultText: {
    color: '#E2E8F0',
    fontSize: 12,
  },
  matchList: {
    marginTop: 8,
  },
  error: {
    color: '#FCA5A5',
    marginTop: 8,
  },
  hint: {
    color: '#A7F3D0',
    fontSize: 12,
    marginTop: 6,
  },
  preview: {
    marginTop: 10,
    height: 140,
    borderRadius: 10,
    backgroundColor: '#0B0F1A',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
});

const formatMatchLabel = (match: MatchItem) => {
  const car = match?.car;
  if (car?.model_name) {
    return String(car.model_name);
  }
  if (car?.model_number) {
    return String(car.model_number);
  }
  return String(match?.car_id || 'Unknown');
};
