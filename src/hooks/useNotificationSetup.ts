import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NotificationService } from '../services/NotificationService';
import { useNotificationStore } from '../store/notificationStore';

export function useNotificationSetup(): void {
  const navigation = useNavigation();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const service = NotificationService.getInstance();

    service.setNavigationCallback((screen, params) => {
      (navigation as { navigate: (screen: string, params?: Record<string, string>) => void }).navigate(screen, params);
    });

    useNotificationStore.getState().loadFromStorage();

    service.initialize().catch((err) => {
      console.error('Notification init failed:', err);
    });

    service.onAppOpen();
  }, [navigation]);
}
