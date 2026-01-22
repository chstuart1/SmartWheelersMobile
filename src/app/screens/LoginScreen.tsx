import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useScreenTracking } from '../hooks/useScreenTracking';
import { RecaptchaV3 } from '../components/RecaptchaV3';
import { fetchRecaptchaConfig } from '../../services/recaptcha/recaptchaConfig';

export const LoginScreen = () => {
  const { signIn } = useAuth();
  useScreenTracking('Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaConfig, setCaptchaConfig] = useState<{ siteKey: string; useEnterprise: boolean } | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    if (__DEV__) {
      try {
        await signIn(email, password, { skipCaptcha: true });
      } catch (err: any) {
        const payload = err?.payload;
        if (payload?.requires_challenge) {
          setError('Additional security verification required. Please sign in on the web app to complete the challenge.');
        } else {
          setError(err?.message || 'Login failed.');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      const config = captchaConfig || (await fetchRecaptchaConfig());
      if (!config?.siteKey) {
        throw new Error('Security verification unavailable');
      }
      setCaptchaConfig(config);
      setShowCaptcha(true);
    } catch (err: any) {
      const payload = err?.payload;
      if (payload?.requires_challenge) {
        setError('Additional security verification required. Please sign in on the web app to complete the challenge.');
      } else {
        setError(err?.message || 'Login failed.');
      }
      setIsSubmitting(false);
    }
  };

  const handleCaptchaToken = async (token: string) => {
    setShowCaptcha(false);
    try {
      await signIn(email, password, { captchaV3Token: token });
    } catch (err: any) {
      const payload = err?.payload;
      if (payload?.requires_challenge) {
        setError('Additional security verification required. Please sign in on the web app to complete the challenge.');
        return;
      }
      setError(err?.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>Use your SmartWheelers account</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#64748B"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </TouchableOpacity>

      {showCaptcha && captchaConfig ? (
        <RecaptchaV3
          siteKey={captchaConfig.siteKey}
          useEnterprise={captchaConfig.useEnterprise}
          action="login"
          onToken={handleCaptchaToken}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#CBD5F5',
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#111827',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#FCA5A5',
    marginTop: 8,
  },
});
