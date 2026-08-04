import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NotificationService } from '../services/NotificationService';
import { RootStackParamList } from '../navigation/types';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavProp>();

  const sendTestNotification = useCallback(async () => {
    await NotificationService.getInstance().displayLocalNotification(
      'Test Notification',
      'This is a local test notification with deep link support.',
      { screen: 'OrderDetail', params: { orderId: 'TEST-001' } },
      'orders',
    );
  }, []);

  const scheduleTestNotification = useCallback(async () => {
    const fiveSecondsLater = Date.now() + 5000;
    await NotificationService.getInstance().scheduleNotification(
      'Scheduled Reminder',
      'This notification was scheduled 5 seconds ago!',
      fiveSecondsLater,
      { screen: 'NotificationCenter' },
      'reminders',
    );
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Push Notifications Demo</Text>
      <Text style={styles.subtitle}>React Native + FCM + Notifee</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.button} onPress={sendTestNotification}>
          <Text style={styles.buttonText}>Send Test Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={scheduleTestNotification}>
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Schedule (5s delay)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate('NotificationCenter')}
        >
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Notification Center</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate('NotificationPreferences')}
        >
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Preferences</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
    marginBottom: 32,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6D6D72',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#007AFF',
  },
});
