import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, {
  AndroidStyle,
  EventType,
  Event as NotifeeEvent,
  TimestampTrigger,
  TriggerType,
  IntervalTrigger,
  TimeUnit,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { ChannelIds, createNotificationChannels } from './NotificationChannels';
import { useNotificationStore } from '../store/notificationStore';
import { AppNotification, NotificationCategory, NotificationData } from '../types/notification';
import { parseDeepLink } from '../utils/deepLink';
import { isInQuietHours } from '../utils/quietHours';
import { setBadgeCount, clearBadge } from '../utils/badge';
import { storage, StorageKeys } from '../utils/storage';

type NavigationCallback = (screen: string, params?: Record<string, string>) => void;

export class NotificationService {
  private static instance: NotificationService;
  private navigationCallback: NavigationCallback | null = null;
  private initialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  setNavigationCallback(callback: NavigationCallback): void {
    this.navigationCallback = callback;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await createNotificationChannels();
    await this.requestPermission();
    await this.registerToken();
    this.setupTokenRefresh();
    this.setupForegroundHandler();
    this.setupForegroundEventHandler();
    await this.handleInitialNotification();

    this.initialized = true;
  }

  private async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    }
    await notifee.requestPermission();
    return true;
  }

  private async registerToken(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await messaging().registerDeviceForRemoteMessages();
      }
      const token = await messaging().getToken();
      await this.sendTokenToBackend(token);
      storage.set(StorageKeys.FCM_TOKEN, token);
    } catch (error) {
      console.error('Failed to get FCM token:', error);
    }
  }

  private setupTokenRefresh(): void {
    messaging().onTokenRefresh(async (token) => {
      await this.sendTokenToBackend(token);
      storage.set(StorageKeys.FCM_TOKEN, token);
    });
  }

  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      await fetch('https://your-api.com/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
        }),
      });
    } catch (error) {
      console.error('Failed to register token with backend:', error);
    }
  }

  private setupForegroundHandler(): void {
    messaging().onMessage(async (remoteMessage) => {
      await this.handleForegroundMessage(remoteMessage);
    });
  }

  private setupForegroundEventHandler(): void {
    notifee.onForegroundEvent(async (event) => {
      await this.handleNotifeeEvent(event);
    });
  }

  private async handleForegroundMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): Promise<void> {
    const store = useNotificationStore.getState();
    const data = remoteMessage.data as NotificationData | undefined;
    const category = (data?.category as NotificationCategory) ?? 'general';

    if (!store.preferences[category as keyof typeof store.preferences]) return;

    if (
      store.preferences.quietHoursEnabled &&
      isInQuietHours(store.preferences.quietHoursStart, store.preferences.quietHoursEnd)
    ) {
      this.storeNotification(remoteMessage);
      return;
    }

    await this.displayNotification(remoteMessage);
    this.storeNotification(remoteMessage);
    await setBadgeCount(store.unreadCount + 1);
  }

  async handleBackgroundMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): Promise<void> {
    this.storeNotification(remoteMessage);
    const store = useNotificationStore.getState();
    await setBadgeCount(store.unreadCount + 1);
  }

  private async handleInitialNotification(): Promise<void> {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      const data = remoteMessage.data as NotificationData | undefined;
      const target = parseDeepLink(data);
      if (target && this.navigationCallback) {
        this.navigationCallback(target.screen, target.params);
      }
    }

    const initialNotification = await notifee.getInitialNotification();
    if (initialNotification?.notification?.data) {
      const data = initialNotification.notification.data as NotificationData;
      const target = parseDeepLink(data);
      if (target && this.navigationCallback) {
        this.navigationCallback(target.screen, target.params);
      }
    }

    await clearBadge();
  }

  private async handleNotifeeEvent(event: NotifeeEvent): Promise<void> {
    const { type, detail } = event;

    switch (type) {
      case EventType.PRESS:
        if (detail.notification?.data) {
          const data = detail.notification.data as NotificationData;
          const target = parseDeepLink(data);
          if (target && this.navigationCallback) {
            this.navigationCallback(target.screen, target.params);
          }
          if (detail.notification.id) {
            useNotificationStore.getState().markAsRead(detail.notification.id);
          }
        }
        break;

      case EventType.ACTION_PRESS:
        await this.handleActionPress(
          detail.pressAction?.id ?? '',
          detail.notification?.data as NotificationData | undefined,
          detail.notification?.id,
        );
        break;

      case EventType.DISMISSED:
        break;
    }
  }

  async handleNotifeeBackgroundEvent(event: NotifeeEvent): Promise<void> {
    await this.handleNotifeeEvent(event);
  }

  private async handleActionPress(
    actionId: string,
    data: NotificationData | undefined,
    notificationId: string | undefined,
  ): Promise<void> {
    switch (actionId) {
      case 'mark-read':
        if (notificationId) {
          useNotificationStore.getState().markAsRead(notificationId);
        }
        break;

      case 'reply':
        if (data) {
          const target = parseDeepLink(data);
          if (target && this.navigationCallback) {
            this.navigationCallback(target.screen, target.params);
          }
        }
        break;
    }
  }

  private async displayNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): Promise<void> {
    const { notification, data } = remoteMessage;
    const category = (data?.category as NotificationCategory) ?? 'general';
    const channelId = this.getChannelForCategory(category);

    const androidConfig: Record<string, unknown> = {
      channelId,
      pressAction: { id: 'default' },
      smallIcon: 'ic_notification',
      actions: [
        { title: 'Mark as Read', pressAction: { id: 'mark-read' } },
        { title: 'Reply', pressAction: { id: 'reply' } },
      ],
    };

    if (data?.imageUrl) {
      androidConfig.style = {
        type: AndroidStyle.BIGPICTURE,
        picture: data.imageUrl as string,
      };
    } else if (notification?.body && notification.body.length > 100) {
      androidConfig.style = {
        type: AndroidStyle.BIGTEXT,
        text: notification.body,
      };
    }

    if (data?.groupId) {
      androidConfig.groupId = data.groupId;
      androidConfig.groupSummary = data.groupSummary === 'true';
    }

    const iosConfig: Record<string, unknown> = {
      categoryId: category,
    };

    if (data?.imageUrl) {
      iosConfig.attachments = [{ url: data.imageUrl as string }];
    }

    await notifee.displayNotification({
      id: remoteMessage.messageId ?? undefined,
      title: notification?.title ?? 'Notification',
      body: notification?.body ?? '',
      data: data as Record<string, string> | undefined,
      android: androidConfig as never,
      ios: iosConfig as never,
    });
  }

  private storeNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): void {
    const { notification, data, messageId } = remoteMessage;
    const category = (data?.category as NotificationCategory) ?? 'general';

    const appNotification: AppNotification = {
      id: messageId ?? Date.now().toString(),
      title: notification?.title ?? 'Notification',
      body: notification?.body ?? '',
      data: data as NotificationData | undefined,
      imageUrl: (data?.imageUrl as string) ?? notification?.android?.imageUrl,
      timestamp: Date.now(),
      read: false,
      category,
    };

    useNotificationStore.getState().addNotification(appNotification);
  }

  private getChannelForCategory(category: NotificationCategory): string {
    switch (category) {
      case 'orders':
        return ChannelIds.ORDERS;
      case 'chat':
        return ChannelIds.CHAT;
      case 'promotions':
        return ChannelIds.PROMOTIONS;
      default:
        return ChannelIds.DEFAULT;
    }
  }

  async displayLocalNotification(
    title: string,
    body: string,
    data?: NotificationData,
    category: NotificationCategory = 'general',
  ): Promise<string> {
    const channelId = this.getChannelForCategory(category);

    const id = await notifee.displayNotification({
      title,
      body,
      data: data as Record<string, string> | undefined,
      android: {
        channelId,
        pressAction: { id: 'default' },
        smallIcon: 'ic_notification',
      },
      ios: {
        categoryId: category,
      },
    });

    const appNotification: AppNotification = {
      id,
      title,
      body,
      data,
      timestamp: Date.now(),
      read: false,
      category,
    };
    useNotificationStore.getState().addNotification(appNotification);

    return id;
  }

  async scheduleNotification(
    title: string,
    body: string,
    timestamp: number,
    data?: NotificationData,
    category: NotificationCategory = 'general',
  ): Promise<string> {
    const channelId = this.getChannelForCategory(category);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp,
    };

    return notifee.createTriggerNotification(
      {
        title,
        body,
        data: data as Record<string, string> | undefined,
        android: {
          channelId,
          pressAction: { id: 'default' },
          smallIcon: 'ic_notification',
        },
        ios: { categoryId: category },
      },
      trigger,
    );
  }

  async scheduleRepeatingNotification(
    title: string,
    body: string,
    interval: number,
    timeUnit: TimeUnit,
    data?: NotificationData,
    category: NotificationCategory = 'general',
  ): Promise<string> {
    const channelId = this.getChannelForCategory(category);

    const trigger: IntervalTrigger = {
      type: TriggerType.INTERVAL,
      interval,
      timeUnit,
    };

    return notifee.createTriggerNotification(
      {
        title,
        body,
        data: data as Record<string, string> | undefined,
        android: {
          channelId,
          pressAction: { id: 'default' },
          smallIcon: 'ic_notification',
        },
        ios: { categoryId: category },
      },
      trigger,
    );
  }

  async cancelScheduledNotification(notificationId: string): Promise<void> {
    await notifee.cancelTriggerNotification(notificationId);
  }

  async getPendingNotifications(): Promise<string[]> {
    const ids = await notifee.getTriggerNotificationIds();
    return ids;
  }

  async subscribeToTopic(topic: string): Promise<void> {
    await messaging().subscribeToTopic(topic);
  }

  async unsubscribeFromTopic(topic: string): Promise<void> {
    await messaging().unsubscribeFromTopic(topic);
  }

  async onAppOpen(): Promise<void> {
    await clearBadge();
  }
}
