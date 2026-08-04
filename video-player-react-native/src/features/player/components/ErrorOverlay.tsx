import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

interface Props {
  message: string;
  onRetry: () => void;
}

export function ErrorOverlay({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  message: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 32,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  retryText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
});
