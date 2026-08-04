import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

export const ChannelIds = {
  ORDERS: 'orders',
  PROMOTIONS: 'promotions',
  CHAT: 'chat',
  DEFAULT: 'default',
} as const;

export async function createNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await notifee.createChannel({
    id: ChannelIds.ORDERS,
    name: 'Orders',
    description: 'Order status updates and delivery notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  await notifee.createChannel({
    id: ChannelIds.PROMOTIONS,
    name: 'Promotions',
    description: 'Deals, discounts, and promotional offers',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
  });

  await notifee.createChannel({
    id: ChannelIds.CHAT,
    name: 'Chat',
    description: 'Chat messages and replies',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  await notifee.createChannel({
    id: ChannelIds.DEFAULT,
    name: 'General',
    description: 'General notifications',
    importance: AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

export async function isChannelBlocked(channelId: string): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  const channel = await notifee.getChannel(channelId);
  return channel?.blocked ?? false;
}
