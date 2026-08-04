import notifee from '@notifee/react-native';
import { Platform } from 'react-native';

export async function setBadgeCount(count: number): Promise<void> {
  if (Platform.OS === 'ios') {
    await notifee.setBadgeCount(count);
  } else {
    await notifee.setBadgeCount(count);
  }
}

export async function clearBadge(): Promise<void> {
  await notifee.setBadgeCount(0);
}

export async function incrementBadge(current: number): Promise<void> {
  await setBadgeCount(current + 1);
}
