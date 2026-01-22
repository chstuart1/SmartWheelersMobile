import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { captureImage } from '../utils/imagePicker';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { SmartScanApi } from '../../services/smartScan/smartScanApi';
import { TetherApi } from '../../services/tether/tetherApi';

type Props = {
  onBack: () => void;
};

export const SmartCropScreen = ({ onBack }: Props) => {
  useScreenTracking('SmartCrop');
  const [frontImage, setFrontImage] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [backImage, setBackImage] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formSessionId, setFormSessionId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [frontCropReady, setFrontCropReady] = useState(false);
  const [backCropReady, setBackCropReady] = useState(false);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFront = async () => {
    setError(null);
    const image = await captureImage('front');
    setFrontImage(image);
    try {
      const response = await SmartScanApi.quickCrop(image, 'front');
      const payload = (response as any)?.data || response;
      const croppedImage = payload?.data?.cropped_image || payload?.cropped_image;
      setFrontPreview(normalizePreview(croppedImage));
      setFrontCropReady(true);
    } catch {
      setFrontCropReady(false);
    }
  };

  const handleBack = async () => {
    setError(null);
    const image = await captureImage('back');
    setBackImage(image);
    try {
      const response = await SmartScanApi.quickCrop(image, 'back');
      const payload = (response as any)?.data || response;
      const croppedImage = payload?.data?.cropped_image || payload?.cropped_image;
      setBackPreview(normalizePreview(croppedImage));
      setBackCropReady(true);
    } catch {
      setBackCropReady(false);
    }
  };

  const reset = () => {
    setFrontImage(null);
    setBackImage(null);
    setError(null);
    setFrontCropReady(false);
    setBackCropReady(false);
    setFrontPreview(null);
    setBackPreview(null);
    setUploadSuccess(null);
  };

  const uploadToTether = async () => {
    if (!formSessionId) {
      setError('Form session ID is required to upload.');
      return;
    }
    if (!frontImage || !backImage) {
      setError('Front and back images are required.');
      return;
    }
    setError(null);
    setUploadSuccess(null);
    setIsUploading(true);
    try {
      await TetherApi.uploadPhoto(formSessionId, 'front_image', frontImage);
      await TetherApi.uploadPhoto(formSessionId, 'back_image', backImage);
      setUploadSuccess('Images uploaded to tether.');
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Smart Crop</Text>
      <Text style={styles.subtitle}>Capture front and back images</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Front image</Text>
        <TouchableOpacity style={styles.button} onPress={handleFront}>
          <Text style={styles.buttonText}>{frontImage ? 'Retake front' : 'Capture front'}</Text>
        </TouchableOpacity>
        {frontCropReady ? <Text style={styles.hint}>Quick crop ready</Text> : null}
        {frontPreview ? <Image source={{ uri: frontPreview }} style={styles.preview} /> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Back image</Text>
        <TouchableOpacity style={styles.button} onPress={handleBack}>
          <Text style={styles.buttonText}>{backImage ? 'Retake back' : 'Capture back'}</Text>
        </TouchableOpacity>
        {backCropReady ? <Text style={styles.hint}>Quick crop ready</Text> : null}
        {backPreview ? <Image source={{ uri: backPreview }} style={styles.preview} /> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Form session ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter form session id"
          placeholderTextColor="#64748B"
          value={formSessionId}
          onChangeText={setFormSessionId}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {uploadSuccess ? <Text style={styles.success}>{uploadSuccess}</Text> : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={uploadToTether}
          disabled={isUploading || !frontImage || !backImage || !formSessionId}
        >
          {isUploading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Upload to Tether</Text>}
        </TouchableOpacity>
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
  input: {
    backgroundColor: '#111827',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
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
  error: {
    color: '#FCA5A5',
    marginTop: 8,
  },
  success: {
    color: '#86EFAC',
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
});
