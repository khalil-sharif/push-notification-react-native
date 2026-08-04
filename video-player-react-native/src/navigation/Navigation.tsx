import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LibraryScreen } from '../features/library/screens/LibraryScreen';
import { PlayerScreen } from '../features/player/screens/PlayerScreen';
import { DownloadsScreen } from '../features/downloads/screens/DownloadsScreen';
import { colors } from '../theme/colors';

export type RootStackParamList = {
  Library: undefined;
  Player: { videoId: string };
  Downloads: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Library" component={LibraryScreen} options={{ title: 'Video Library' }} />
        <Stack.Screen name="Player" component={PlayerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Downloads" component={DownloadsScreen} options={{ title: 'Downloads' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
