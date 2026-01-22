import { apiRequest } from '../api/apiClient';

export type RecaptchaConfig = {
  useEnterprise: boolean;
  siteKey: string;
};

export const fetchRecaptchaConfig = async (): Promise<RecaptchaConfig | null> => {
  try {
    const response = await apiRequest('/auth/recaptcha/config', { method: 'GET', timeoutMs: 15000 });
    const payload = (response as any)?.data || response;
    const config = payload?.data;
    if (!config?.siteKey) {
      return null;
    }
    return {
      useEnterprise: !!config.useEnterprise,
      siteKey: config.siteKey,
    };
  } catch {
    return null;
  }
};
