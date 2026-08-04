import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { AppNotification } from '../types/notification';

interface NotificationItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
  onDelete: (id: string) => void;
}

function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case 'orders': return '📦';
    case 'chat': return '💬';
    case 'promotions': return '🏷️';
    case 'reminders': return '⏰';
    default: return '🔔';
  }
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onDelete,
}) => {
  const handlePress = useCallback(() => onPress(notification), [notification, onPress]);
  const handleDelete = useCallback(() => onDelete(notification.id), [notification.id, onDelete]);

  return (
    <TouchableOpacity
      style={[styles.container, !notification.read && styles.unread]}
      onPress={handlePress}
      onLongPress={handleDelete}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getCategoryIcon(notification.category)}</Text>
        {!notification.read && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.time}>{formatTimestamp(notification.timestamp)}</Text>
        </View>
        <Text style={styles.body} numberOfLines={2}>
          {notification.body}
        </Text>
      </View>

      {notification.imageUrl && (
        <Image source={{ uri: notification.imageUrl }} style={styles.image} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
    alignItems: 'center',
  },
  unread: {
    backgroundColor: '#F0F4FF',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#8E8E93',
  },
  body: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginLeft: 12,
  },
});
