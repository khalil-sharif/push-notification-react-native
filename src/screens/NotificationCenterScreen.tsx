import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationItem } from '../components/NotificationItem';
import { AppNotification } from '../types/notification';
import { parseDeepLink } from '../utils/deepLink';

export const NotificationCenterScreen: React.FC = () => {
  const navigation = useNavigation<{ navigate: (screen: string, params?: Record<string, string>) => void }>();
  const notifications = useNotificationStore((s) => s.notifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);
  const [refreshing, setRefreshing] = React.useState(false);

  const handlePress = useCallback(
    (notification: AppNotification) => {
      markAsRead(notification.id);
      const target = parseDeepLink(notification.data);
      if (target) {
        navigation.navigate(target.screen, target.params);
      }
    },
    [markAsRead, navigation],
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete Notification', 'Remove this notification?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteNotification(id) },
      ]);
    },
    [deleteNotification],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // In production, fetch from backend: GET /notifications
    // const response = await fetch('https://your-api.com/notifications');
    // const data = await response.json();
    // data.forEach(n => addNotification(n));
    setRefreshing(false);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <NotificationItem
        notification={item}
        onPress={handlePress}
        onDelete={handleDelete}
      />
    ),
    [handlePress, handleDelete],
  );

  const keyExtractor = useCallback((item: AppNotification) => item.id, []);

  return (
    <View style={styles.container}>
      {notifications.length > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyBody}>You're all caught up!</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  markAllButton: {
    padding: 12,
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  markAllText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 15,
    color: '#8E8E93',
  },
});
