import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../services/api/apiClient';
import { ApiEndpoints } from '../../services/api/endpoints';
import { getAuthToken, setAuthToken } from '../../services/auth/tokenStorage';
import { getStoredUser, setStoredUser } from '../../services/auth/userStorage';
import { setAnalyticsUserId, setAnalyticsUserProperties } from '../../services/analytics/analytics';

type AuthUser = {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string, options?: { captchaV3Token?: string; skipCaptcha?: boolean }) => Promise<void>;
  signOut: () => Promise<void>;
  pendingTwoFactor: { userId: string; email?: string } | null;
  completeTwoFactor: (code: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTwoFactor, setPendingTwoFactor] = useState<{ userId: string; email?: string } | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      const token = await getAuthToken();
      const storedUser = await getStoredUser();
      if (token && storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    hydrate();
  }, []);

  const signIn = useCallback(async (
    email: string,
    password: string,
    options?: { captchaV3Token?: string; skipCaptcha?: boolean }
  ) => {
    const response = await apiRequest<any>(ApiEndpoints.auth.login, {
      method: 'POST',
      body: {
        email,
        password,
        ...(options?.captchaV3Token ? { captcha_v3_token: options.captchaV3Token } : {}),
        ...(options?.skipCaptcha ? { skip_captcha: true } : {}),
      },
    });

    const payload = response?.data?.data ?? response?.data ?? response;

    if (payload?.requires_2fa || response?.data?.requires_2fa) {
      const userId = payload?.user_id || response?.data?.user_id;
      if (userId) {
        setPendingTwoFactor({ userId, email });
        return;
      }
      throw new Error('Two-factor authentication required');
    }

    const token = payload?.token || payload?.access_token;
    const userData = payload?.user || payload?.profile || payload;

    if (!token || !userData) {
      throw new Error('Login response missing token or user');
    }

    await setAuthToken(token);
    await setStoredUser(userData);
    setUser(userData);
    await setAnalyticsUserId(userData?.id || null);
    await setAnalyticsUserProperties({
      is_admin: userData?.is_admin ? 'true' : 'false',
    });
  }, []);

  const completeTwoFactor = useCallback(async (code: string) => {
    if (!pendingTwoFactor?.userId) {
      throw new Error('Missing two-factor context');
    }

    const response = await apiRequest<any>(ApiEndpoints.auth.twoFactorComplete, {
      method: 'POST',
      body: {
        user_id: pendingTwoFactor.userId,
        two_factor_code: code,
      },
    });

    const payload = response?.data?.data ?? response?.data ?? response;
    const token = payload?.token || payload?.access_token;

    if (!token || !payload) {
      throw new Error('Two-factor login failed');
    }

    await setAuthToken(token);
    await setStoredUser(payload);
    setUser(payload);
    setPendingTwoFactor(null);
    await setAnalyticsUserId(payload?.id || null);
    await setAnalyticsUserProperties({
      is_admin: payload?.is_admin ? 'true' : 'false',
    });
  }, [pendingTwoFactor]);

  const signOut = useCallback(async () => {
    try {
      await apiRequest(ApiEndpoints.auth.logout, { method: 'POST' });
    } catch {
      // Logout failures should not block local sign-out
    }
    await setAuthToken(null);
    await setStoredUser(null);
    setUser(null);
    setPendingTwoFactor(null);
    await setAnalyticsUserId(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signOut, pendingTwoFactor, completeTwoFactor }),
    [user, isLoading, pendingTwoFactor, signIn, signOut, completeTwoFactor]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
