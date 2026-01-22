import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { TetherScreen } from './TetherScreen';
import { SmartCropScreen } from './SmartCropScreen';
import { SmartScanScreen } from './SmartScanScreen';

export const HomeScreen = () => {
  const { user, signOut } = useAuth();
  const [activeScreen, setActiveScreen] = useState<'home' | 'tether' | 'smart-crop' | 'smart-scan'>('home');
  useScreenTracking('Home');

  if (activeScreen === 'tether') {
    return <TetherScreen onBack={() => setActiveScreen('home')} />;
  }
  if (activeScreen === 'smart-crop') {
    return <SmartCropScreen onBack={() => setActiveScreen('home')} />;
  }
  if (activeScreen === 'smart-scan') {
    return <SmartScanScreen onBack={() => setActiveScreen('home')} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartWheelers Mobile</Text>
      <Text style={styles.subtitle}>Initial setup in progress</Text>
      {user?.email ? (
        <Text style={styles.userLabel}>Signed in as {user.email}</Text>
      ) : null}
      <View style={styles.list}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveScreen('tether')}>
          <Text style={styles.listItem}>Tether</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveScreen('smart-crop')}>
          <Text style={styles.listItem}>Smart Crop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveScreen('smart-scan')}>
          <Text style={styles.listItem}>Smart Scan</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
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
    marginBottom: 20,
  },
  userLabel: {
    color: '#CBD5F5',
    fontSize: 12,
    marginBottom: 12,
  },
  list: {
    marginTop: 8,
  },
  menuItem: {
    paddingVertical: 8,
  },
  listItem: {
    color: '#E2E8F0',
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 16,
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

