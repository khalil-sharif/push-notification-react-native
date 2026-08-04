export interface AppNotification {
  id: string;
  title: string;
  body: string;
  data?: NotificationData;
  imageUrl?: string;
  timestamp: number;
  read: boolean;
  category: NotificationCategory;
}

export interface NotificationData {
  screen?: string;
  params?: Record<string, string>;
  [key: string]: unknown;
}

export type NotificationCategory = 'orders' | 'chat' | 'promotions' | 'reminders' | 'general';

export interface NotificationPreferences {
  orders: boolean;
  chat: boolean;
  promotions: boolean;
  reminders: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: number;
  quietHoursEnd: number;
}

export interface DeviceRegistration {
  token: string;
  platform: 'ios' | 'android';
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  orders: true,
  chat: true,
  promotions: true,
  reminders: true,
  quietHoursEnabled: false,
  quietHoursStart: 22,
  quietHoursEnd: 7,
};
