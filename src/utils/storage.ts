import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'notification-storage' });

export const StorageKeys = {
  NOTIFICATIONS: 'notifications',
  PREFERENCES: 'preferences',
  FCM_TOKEN: 'fcm_token',
} as const;

export function getStoredJSON<T>(key: string, fallback: T): T {
  const raw = storage.getString(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setStoredJSON<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}
