// Mock dependencies before imports
jest.mock('../../../services/api/apiClient', () => ({
  apiRequest: jest.fn(),
}));

jest.mock('../../../services/auth/tokenStorage', () => ({
  getAuthToken: jest.fn(),
  setAuthToken: jest.fn(),
}));

jest.mock('../../../services/auth/userStorage', () => ({
  getStoredUser: jest.fn(),
  setStoredUser: jest.fn(),
}));

jest.mock('../../../services/analytics/analytics', () => ({
  setAnalyticsUserId: jest.fn(),
  setAnalyticsUserProperties: jest.fn(),
}));

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import * as apiClient from '../../../services/api/apiClient';
import * as tokenStorage from '../../../services/auth/tokenStorage';
import * as userStorage from '../../../services/auth/userStorage';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (tokenStorage.getAuthToken as jest.Mock).mockResolvedValue(null);
    (userStorage.getStoredUser as jest.Mock).mockResolvedValue(null);
  });

  it('should initialize with no user when no token exists', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  it('should sign in successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const mockToken = 'test-token';

    (apiClient.apiRequest as jest.Mock).mockResolvedValueOnce({
      data: {
        token: mockToken,
        user: mockUser,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(tokenStorage.setAuthToken).toHaveBeenCalledWith(mockToken);
  });

  it('should handle 2FA requirement', async () => {
    (apiClient.apiRequest as jest.Mock).mockResolvedValueOnce({
      data: {
        requires_2fa: true,
        user_id: '123',
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });

    expect(result.current.pendingTwoFactor).toEqual({
      userId: '123',
      email: 'test@example.com',
    });
  });

  it('should sign out successfully', async () => {
    (apiClient.apiRequest as jest.Mock).mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(tokenStorage.setAuthToken).toHaveBeenCalledWith(null);
  });
});
