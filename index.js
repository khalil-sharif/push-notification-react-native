import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import { App } from './src/App';
import { name as appName } from './app.json';
import { NotificationService } from './src/services/NotificationService';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  await NotificationService.getInstance().handleBackgroundMessage(remoteMessage);
});

notifee.onBackgroundEvent(async (event) => {
  await NotificationService.getInstance().handleNotifeeBackgroundEvent(event);
});

AppRegistry.registerComponent(appName, () => App);
