export type RootStackParamList = {
  Home: undefined;
  NotificationCenter: undefined;
  NotificationPreferences: undefined;
  OrderDetail: { orderId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
