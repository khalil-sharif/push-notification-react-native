import React, { useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { usePlayerStore } from '../../../stores/playerStore';
import { colors } from '../../../theme/colors';

interface Props {
  onSeek: (time: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function GestureOverlay({ onSeek }: Props) {
  const rewindOpacity = useSharedValue(0);
  const forwardOpacity = useSharedValue(0);

  const seekBy = useCallback(
    (delta: number) => {
      const { position, duration } = usePlayerStore.getState();
      const target = Math.max(0, Math.min(duration, position + delta));
      onSeek(target);
    },
    [onSeek],
  );

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (e.x < SCREEN_WIDTH / 2) {
        rewindOpacity.value = withSequence(withTiming(1, { duration: 150 }), withTiming(0, { duration: 600 }));
        runOnJS(seekBy)(-10);
      } else {
        forwardOpacity.value = withSequence(withTiming(1, { duration: 150 }), withTiming(0, { duration: 600 }));
        runOnJS(seekBy)(10);
      }
    });

  const rewindStyle = useAnimatedStyle(() => ({ opacity: rewindOpacity.value }));
  const forwardStyle = useAnimatedStyle(() => ({ opacity: forwardOpacity.value }));

  return (
    <GestureDetector gesture={doubleTap}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[styles.seekIndicator, styles.left, rewindStyle]}>
          <Animated.Text style={styles.seekText}>-10s</Animated.Text>
        </Animated.View>
        <Animated.View style={[styles.seekIndicator, styles.right, forwardStyle]}>
          <Animated.Text style={styles.seekText}>+10s</Animated.Text>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  seekIndicator: {
    position: 'absolute',
    top: '30%',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  left: {
    left: '15%',
  },
  right: {
    right: '15%',
  },
  seekText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
});
