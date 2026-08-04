import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export const OrderDetailScreen: React.FC<Props> = ({ route }) => {
  const { orderId } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Order ID</Text>
        <Text style={styles.value}>{orderId}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.status}>In Progress</Text>
      </View>
      <Text style={styles.hint}>
        This screen was opened via deep link from a notification.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  status: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34C759',
  },
  hint: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 24,
  },
});
