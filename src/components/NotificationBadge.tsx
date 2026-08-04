import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNotificationStore } from '../store/notificationStore';

interface NotificationBadgeProps {
  onPress: () => void;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ onPress }) => {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={styles.bell}>🔔</Text>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  bell: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
