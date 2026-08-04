import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import type { VideoRef } from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../../../stores/playerStore';
import { SeekBar } from './SeekBar';
import { formatTime } from '../../../utils/time';
import { colors } from '../../../theme/colors';

interface Props {
  onSeek: (time: number) => void;
  videoRef: React.RefObject<VideoRef>;
}

export function PlayerControls({ onSeek, videoRef }: Props) {
  const navigation = useNavigation();
  const {
    currentVideo,
    isPlaying,
    position,
    duration,
    speed,
    isFullscreen,
    controlsVisible,
    setPlaying,
    setFullscreen,
    setControlsVisible,
    setPiP,
    setMiniPlayer,
  } = usePlayerStore();

  const opacity = useSharedValue(1);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const resetTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (usePlayerStore.getState().isPlaying) {
        opacity.value = withTiming(0, { duration: 300 });
        runOnJS(setControlsVisible)(false);
      }
    }, 3000);
  }, [opacity, setControlsVisible]);

  useEffect(() => {
    if (controlsVisible) {
      opacity.value = withTiming(1, { duration: 200 });
      resetTimer();
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [controlsVisible, opacity, resetTimer]);

  const toggleControls = useCallback(() => {
    if (controlsVisible) {
      opacity.value = withTiming(0, { duration: 300 });
      setControlsVisible(false);
    } else {
      setControlsVisible(true);
    }
  }, [controlsVisible, opacity, setControlsVisible]);

  const togglePlay = useCallback(() => {
    setPlaying(!isPlaying);
    resetTimer();
  }, [isPlaying, setPlaying, resetTimer]);

  const toggleFullscreen = useCallback(() => {
    setFullscreen(!isFullscreen);
  }, [isFullscreen, setFullscreen]);

  const handlePiP = useCallback(() => {
    setPiP(true);
  }, [setPiP]);

  const handleBack = useCallback(() => {
    if (isFullscreen) {
      setFullscreen(false);
    } else {
      setMiniPlayer(true);
      navigation.goBack();
    }
  }, [isFullscreen, setFullscreen, setMiniPlayer, navigation]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <TouchableOpacity
      style={StyleSheet.absoluteFill}
      activeOpacity={1}
      onPress={toggleControls}
    >
      <Animated.View style={[styles.overlay, animatedStyle]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <Text style={styles.icon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {currentVideo?.title}
          </Text>
          <TouchableOpacity onPress={handlePiP} style={styles.iconBtn}>
            <Text style={styles.icon}>⧉</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.center}>
          <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomBar}>
          <Text style={styles.time}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>
          <SeekBar onSeek={onSeek} />
          <View style={styles.bottomActions}>
            <Text style={styles.speedLabel}>{speed}x</Text>
            <TouchableOpacity onPress={toggleFullscreen} style={styles.iconBtn}>
              <Text style={styles.icon}>{isFullscreen ? '⊡' : '⊞'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 32,
    color: colors.text,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  time: {
    color: colors.text,
    fontSize: 12,
    marginBottom: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  speedLabel: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 8,
  },
  icon: {
    fontSize: 22,
    color: colors.text,
  },
});
