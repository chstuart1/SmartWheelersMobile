import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { Screen } from './components/Screen';
import { HomeScreen } from './screens/HomeScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { TwoFactorScreen } from './screens/TwoFactorScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppRoot = () => {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <AuthProvider>
          <AppGate />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

const AppGate = () => {
  const { isLoading, user, pendingTwoFactor } = useAuth();

  if (isLoading) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      </Screen>
    );
  }

  if (pendingTwoFactor) {
    return (
      <Screen>
        <TwoFactorScreen />
      </Screen>
    );
  }

  return <Screen>{user ? <HomeScreen /> : <LoginScreen />}</Screen>;
};

export default AppRoot;
