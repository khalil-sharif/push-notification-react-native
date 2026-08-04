import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator, linking } from './navigation/RootNavigator';

export const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
