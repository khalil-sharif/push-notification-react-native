import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { usePlayerStore } from '../../../stores/playerStore';
import { formatTime } from '../../../utils/time';
import { colors } from '../../../theme/colors';

interface Props {
  onSeek: (time: number) => void;
}

export function SeekBar({ onSeek }: Props) {
  const { position, duration, buffered } = usePlayerStore();
  const [barWidth, setBarWidth] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);

  const thumbScale = useSharedValue(1);
  const tooltipOpacity = useSharedValue(0);

  const progress = duration > 0 ? position / duration : 0;
  const bufferedProgress = duration > 0 ? buffered / duration : 0;
  const displayProgress = isSeeking ? (duration > 0 ? seekTime / duration : 0) : progress;

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  }, []);

  const clampSeek = useCallback(
    (x: number) => {
      const pct = Math.max(0, Math.min(1, x / barWidth));
      return pct * duration;
    },
    [barWidth, duration],
  );

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      thumbScale.value = withTiming(1.6);
      tooltipOpacity.value = withTiming(1);
      const time = clampSeek(e.x);
      runOnJS(setSeekTime)(time);
      runOnJS(setIsSeeking)(true);
    })
    .onUpdate((e) => {
      const time = clampSeek(e.x);
      runOnJS(setSeekTime)(time);
    })
    .onEnd((e) => {
      thumbScale.value = withTiming(1);
      tooltipOpacity.value = withTiming(0);
      const time = clampSeek(e.x);
      runOnJS(onSeek)(time);
      runOnJS(setIsSeeking)(false);
    });

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: thumbScale.value }],
  }));

  const tooltipAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tooltipOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.tooltip, tooltipAnimatedStyle, { left: displayProgress * barWidth - 25 }]}>
        <Text style={styles.tooltipText}>{formatTime(isSeeking ? seekTime : position)}</Text>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <View style={styles.track} onLayout={onLayout}>
          <View style={styles.trackBg} />
          <View style={[styles.buffered, { width: `${bufferedProgress * 100}%` }]} />
          <View style={[styles.played, { width: `${displayProgress * 100}%` }]} />
          <Animated.View
            style={[
              styles.thumb,
              thumbAnimatedStyle,
              { left: displayProgress * barWidth - 7 },
            ]}
          />
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 30,
    justifyContent: 'center',
  },
  tooltip: {
    position: 'absolute',
    top: -28,
    width: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  tooltipText: {
    color: colors.text,
    fontSize: 10,
  },
  track: {
    height: 30,
    justifyContent: 'center',
  },
  trackBg: {
    position: 'absolute',
    height: 3,
    width: '100%',
    backgroundColor: colors.trackBg,
    borderRadius: 1.5,
  },
  buffered: {
    position: 'absolute',
    height: 3,
    backgroundColor: colors.buffered,
    borderRadius: 1.5,
  },
  played: {
    position: 'absolute',
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 1.5,
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
  },
});
