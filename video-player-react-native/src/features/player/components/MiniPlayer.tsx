import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../../../stores/playerStore';
import { colors } from '../../../theme/colors';

export function MiniPlayer() {
  const navigation = useNavigation<any>();
  const { currentVideo, isMiniPlayer, isPlaying, setPlaying, setMiniPlayer, reset } = usePlayerStore();
  const translateY = useSharedValue(0);

  const dismiss = useCallback(() => {
    reset();
  }, [reset]);

  const expand = useCallback(() => {
    setMiniPlayer(false);
    navigation.navigate('Player', { videoId: currentVideo?.id });
  }, [currentVideo?.id, navigation, setMiniPlayer]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 60) {
        translateY.value = withTiming(200);
        runOnJS(dismiss)();
      } else {
        translateY.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!isMiniPlayer || !currentVideo) return null;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <TouchableOpacity style={styles.content} onPress={expand} activeOpacity={0.9}>
          {currentVideo.thumbnailUri ? (
            <Image source={{ uri: currentVideo.thumbnailUri }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.placeholder]} />
          )}
          <Text style={styles.title} numberOfLines={1}>
            {currentVideo.title}
          </Text>
          <TouchableOpacity onPress={() => setPlaying(!isPlaying)} style={styles.btn}>
            <Text style={styles.btnIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={dismiss} style={styles.btn}>
            <Text style={styles.btnIcon}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingBottom: 28,
  },
  thumbnail: {
    width: 56,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
  },
  placeholder: {
    backgroundColor: colors.surfaceLight,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    marginHorizontal: 10,
  },
  btn: {
    padding: 8,
  },
  btnIcon: {
    fontSize: 18,
    color: colors.text,
  },
});
