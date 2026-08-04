import { NotificationData } from '../types/notification';

export interface DeepLinkTarget {
  screen: string;
  params?: Record<string, string>;
}

export function parseDeepLink(data: NotificationData | undefined): DeepLinkTarget | null {
  if (!data?.screen) return null;
  return {
    screen: data.screen,
    params: data.params,
  };
}

export function buildNavigationPath(target: DeepLinkTarget): { screen: string; params?: Record<string, string> } {
  return {
    screen: target.screen,
    params: target.params,
  };
}
