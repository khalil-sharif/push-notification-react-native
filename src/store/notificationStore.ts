import { create } from 'zustand';
import {
  AppNotification,
  NotificationPreferences,
  DEFAULT_PREFERENCES,
} from '../types/notification';
import { getStoredJSON, setStoredJSON, StorageKeys } from '../utils/storage';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  addNotification: (notification: AppNotification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  updatePreference: <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K],
  ) => void;
  loadFromStorage: () => void;
}

function computeUnread(notifications: AppNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

function persistNotifications(notifications: AppNotification[]): void {
  setStoredJSON(StorageKeys.NOTIFICATIONS, notifications);
}

function persistPreferences(preferences: NotificationPreferences): void {
  setStoredJSON(StorageKeys.PREFERENCES, preferences);
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: DEFAULT_PREFERENCES,

  addNotification: (notification) => {
    const updated = [notification, ...get().notifications];
    persistNotifications(updated);
    set({ notifications: updated, unreadCount: computeUnread(updated) });
  },

  markAsRead: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    persistNotifications(updated);
    set({ notifications: updated, unreadCount: computeUnread(updated) });
  },

  markAllAsRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    persistNotifications(updated);
    set({ notifications: updated, unreadCount: 0 });
  },

  deleteNotification: (id) => {
    const updated = get().notifications.filter((n) => n.id !== id);
    persistNotifications(updated);
    set({ notifications: updated, unreadCount: computeUnread(updated) });
  },

  updatePreference: (key, value) => {
    const updated = { ...get().preferences, [key]: value };
    persistPreferences(updated);
    set({ preferences: updated });
  },

  loadFromStorage: () => {
    const notifications = getStoredJSON<AppNotification[]>(
      StorageKeys.NOTIFICATIONS,
      [],
    );
    const preferences = getStoredJSON<NotificationPreferences>(
      StorageKeys.PREFERENCES,
      DEFAULT_PREFERENCES,
    );
    set({
      notifications,
      preferences,
      unreadCount: computeUnread(notifications),
    });
  },
}));
