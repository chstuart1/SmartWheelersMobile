import { getApiBaseUrl } from '../../app/config/appConfig';
import { getAuthToken } from '../auth/tokenStorage';
import { AppConfig } from '../../app/config/env';
import { isNetworkAvailable } from '../network/networkMonitor';

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeoutMs?: number;
  env?: 'development' | 'production';
  retry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
};

const DEFAULT_TIMEOUT_MS = 30000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs: number
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const executeRequest = async <TData = any>(
  path: string,
  options: ApiRequestOptions
): Promise<TData> => {
  const {
    method = 'GET',
    body,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    env,
  } = options;

  // Check network availability if retry is enabled
  if (AppConfig.features.enableOfflineRetry && !isNetworkAvailable()) {
    const error: any = new Error('No network connection available');
    error.isOffline = true;
    throw error;
  }

  const baseUrl = getApiBaseUrl(env);
  const token = await getAuthToken();
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;
  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const response = await fetchWithTimeout(
    `${baseUrl}${path}`,
    {
      method,
      headers: requestHeaders,
      body: requestBody,
      credentials: 'include',
    },
    timeoutMs
  );

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    const errorPayload = isJson ? await response.json() : await response.text();
    const message =
      typeof errorPayload === 'string'
        ? errorPayload
        : errorPayload?.message || errorPayload?.error || 'Request failed';
    const error: any = new Error(message);
    if (isJson) {
      error.payload = errorPayload;
    }
    // Mark retryable errors (5xx and network errors)
    if (response.status >= 500 || response.status === 408 || response.status === 429) {
      error.isRetryable = true;
    }
    throw error;
  }

  if (isJson) {
    return response.json();
  }

  return (await response.text()) as TData;
};

export const apiRequest = async <TData = any>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<TData> => {
  const {
    retry = AppConfig.features.enableOfflineRetry,
    maxRetries = AppConfig.features.maxRetryAttempts,
    retryDelay = AppConfig.features.retryDelayMs,
  } = options;

  let lastError: any;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await executeRequest<TData>(path, options);
    } catch (error: any) {
      lastError = error;

      // Don't retry if:
      // - Retry is disabled
      // - Error is not retryable (4xx client errors)
      // - We've exhausted retry attempts
      // - It's an offline error and we're still offline
      if (
        !retry ||
        (!error.isRetryable && !error.isOffline) ||
        attempt >= maxRetries
      ) {
        throw error;
      }

      // If offline, wait for network to come back
      if (error.isOffline) {
        let waitTime = retryDelay;
        while (!isNetworkAvailable() && waitTime < retryDelay * 10) {
          await sleep(retryDelay);
          waitTime += retryDelay;
        }
        if (!isNetworkAvailable()) {
          throw error;
        }
      } else {
        // Exponential backoff for retryable errors
        const delay = retryDelay * Math.pow(2, attempt);
        await sleep(delay);
      }

      attempt++;
      console.log(`[INFO] [API] Retrying request (attempt ${attempt}/${maxRetries})`);
    }
  }

  throw lastError;
};
