import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificationCenterScreen } from '../screens/NotificationCenterScreen';
import { NotificationPreferencesScreen } from '../screens/NotificationPreferencesScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { NotificationBadge } from '../components/NotificationBadge';
import { useNotificationSetup } from '../hooks/useNotificationSetup';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['pushnotifapp://', 'https://pushnotifapp.com'],
  config: {
    screens: {
      Home: '',
      NotificationCenter: 'notifications',
      NotificationPreferences: 'notifications/preferences',
      OrderDetail: 'orders/:orderId',
    },
  },
};

function NavigationSetup() {
  useNotificationSetup();
  return null;
}

export const RootNavigator: React.FC = () => {
  return (
    <>
      <NavigationSetup />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#007AFF',
          headerTitleStyle: { color: '#000000', fontWeight: '600' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'Home',
            headerRight: () => (
              <NotificationBadge onPress={() => navigation.navigate('NotificationCenter')} />
            ),
          })}
        />
        <Stack.Screen
          name="NotificationCenter"
          component={NotificationCenterScreen}
          options={{ title: 'Notifications' }}
        />
        <Stack.Screen
          name="NotificationPreferences"
          component={NotificationPreferencesScreen}
          options={{ title: 'Preferences' }}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ title: 'Order Details' }}
        />
      </Stack.Navigator>
    </>
  );
};

export { linking };
