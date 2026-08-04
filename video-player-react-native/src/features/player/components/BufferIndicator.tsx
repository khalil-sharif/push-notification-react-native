import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../../../theme/colors';

export function BufferIndicator() {
  return (
    <View style={styles.container} pointerEvents="none">
      <ActivityIndicator size="large" color={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
