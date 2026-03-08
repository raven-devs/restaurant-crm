import { apiFetch } from '@/lib/api';

export interface AppSettings {
  id: string;
  currency: string;
  updated_at: string;
}

export const getSettings = () => apiFetch<AppSettings>('/app-settings');

export const updateSettings = (data: Partial<Pick<AppSettings, 'currency'>>) =>
  apiFetch<AppSettings>('/app-settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
