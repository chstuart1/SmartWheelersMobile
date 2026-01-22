// Mock dependencies before imports
jest.mock('../../app/config/appConfig', () => ({
  getApiBaseUrl: jest.fn(() => 'https://api.example.com'),
}));

jest.mock('../auth/tokenStorage', () => ({
  getAuthToken: jest.fn(() => Promise.resolve('test-token')),
}));

jest.mock('../network/networkMonitor', () => ({
  isNetworkAvailable: jest.fn(() => true),
}));

jest.mock('../../app/config/env', () => ({
  AppConfig: {
    features: {
      enableOfflineRetry: true,
      maxRetryAttempts: 3,
      retryDelayMs: 100,
    },
    api: {
      baseUrl: 'https://api.example.com',
      timeout: 30000,
    },
  },
}));

import { apiRequest } from '../apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should make a successful GET request', async () => {
    const mockResponse = { data: 'test' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => mockResponse,
    });

    const result = await apiRequest('/test');

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('should handle POST requests with body', async () => {
    const mockResponse = { success: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: () => 'application/json',
      },
      json: async () => mockResponse,
    });

    const result = await apiRequest('/test', {
      method: 'POST',
      body: { test: 'data' },
    });

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      })
    );
  });

  it('should throw error on failed request', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ error: 'Bad request' }),
    });

    await expect(apiRequest('/test')).rejects.toThrow();
  });
});
