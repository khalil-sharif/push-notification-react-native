import React, { useCallback } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationService } from '../services/NotificationService';
import { NotificationCategory } from '../types/notification';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, value, onValueChange, description }) => (
  <View style={styles.row}>
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      {description && <Text style={styles.rowDescription}>{description}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#E5E5EA', true: '#34C759' }}
      thumbColor="#FFFFFF"
    />
  </View>
);

export const NotificationPreferencesScreen: React.FC = () => {
  const preferences = useNotificationStore((s) => s.preferences);
  const updatePreference = useNotificationStore((s) => s.updatePreference);

  const toggleCategory = useCallback(
    (category: NotificationCategory, value: boolean) => {
      updatePreference(category, value);
      const service = NotificationService.getInstance();
      if (value) {
        service.subscribeToTopic(category);
      } else {
        service.unsubscribeFromTopic(category);
      }
    },
    [updatePreference],
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionHeader}>NOTIFICATION CATEGORIES</Text>
      <View style={styles.section}>
        <ToggleRow
          label="Orders"
          description="Order updates, shipping, and delivery"
          value={preferences.orders}
          onValueChange={(v) => toggleCategory('orders', v)}
        />
        <ToggleRow
          label="Chat"
          description="Messages and replies"
          value={preferences.chat}
          onValueChange={(v) => toggleCategory('chat', v)}
        />
        <ToggleRow
          label="Promotions"
          description="Deals, discounts, and offers"
          value={preferences.promotions}
          onValueChange={(v) => toggleCategory('promotions', v)}
        />
        <ToggleRow
          label="Reminders"
          description="Scheduled reminders and alerts"
          value={preferences.reminders}
          onValueChange={(v) => toggleCategory('reminders', v)}
        />
      </View>

      <Text style={styles.sectionHeader}>QUIET HOURS</Text>
      <View style={styles.section}>
        <ToggleRow
          label="Enable Quiet Hours"
          description={`Suppress notifications ${preferences.quietHoursStart}:00 – ${preferences.quietHoursEnd}:00`}
          value={preferences.quietHoursEnabled}
          onValueChange={(v) => updatePreference('quietHoursEnabled', v)}
        />
      </View>
      <Text style={styles.footer}>
        During quiet hours, notifications are saved but not displayed. You can view them in the Notification Center.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6D6D72',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    color: '#000000',
  },
  rowDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  footer: {
    fontSize: 13,
    color: '#8E8E93',
    paddingHorizontal: 16,
    paddingTop: 8,
    lineHeight: 18,
  },
});
