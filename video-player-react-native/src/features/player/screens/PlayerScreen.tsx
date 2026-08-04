import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, BackHandler } from 'react-native';
import Video, {
  OnLoadData,
  OnProgressData,
  OnBufferData,
  OnVideoErrorData,
  VideoRef,
} from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import KeepAwake from 'react-native-keep-awake';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '../../../stores/playerStore';
import { useLibraryStore } from '../../../stores/libraryStore';
import { PlayerControls } from '../components/PlayerControls';
import { BufferIndicator } from '../components/BufferIndicator';
import { ErrorOverlay } from '../components/ErrorOverlay';
import { SubtitleOverlay } from '../components/SubtitleOverlay';
import { AutoPlayNext } from '../components/AutoPlayNext';
import { GestureOverlay } from '../components/GestureOverlay';
import { colors } from '../../../theme/colors';

export function PlayerScreen() {
  const videoRef = useRef<VideoRef>(null);
  const navigation = useNavigation();
  const {
    currentVideo,
    isPlaying,
    speed,
    isFullscreen,
    isPiP,
    selectedQualityTrack,
    error,
    isBuffering,
    setDuration,
    setPosition,
    setBuffered,
    setBuffering,
    setError,
    setPlaying,
    setFullscreen,
    setMiniPlayer,
    setQualityTracks,
  } = usePlayerStore();

  const updateProgress = useLibraryStore((s) => s.updateProgress);

  useEffect(() => {
    return () => {
      Orientation.lockToPortrait();
    };
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      Orientation.lockToLandscape();
      StatusBar.setHidden(true);
    } else {
      Orientation.lockToPortrait();
      StatusBar.setHidden(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isFullscreen) {
        setFullscreen(false);
        return true;
      }
      setMiniPlayer(true);
      navigation.goBack();
      return true;
    });
    return () => handler.remove();
  }, [isFullscreen, navigation, setFullscreen, setMiniPlayer]);

  const onLoad = useCallback(
    (data: OnLoadData) => {
      setDuration(data.duration);
      if (data.videoTracks) {
        const tracks = data.videoTracks.map((t, i) => ({
          width: t.width,
          height: t.height,
          bitrate: t.bitrate ?? 0,
          trackId: i,
        }));
        setQualityTracks(tracks);
      }
      const lastPos = useLibraryStore.getState().getLastPosition(currentVideo?.id ?? '');
      if (lastPos > 0 && videoRef.current) {
        videoRef.current.seek(lastPos);
      }
    },
    [currentVideo?.id, setDuration, setQualityTracks],
  );

  const onProgress = useCallback(
    (data: OnProgressData) => {
      setPosition(data.currentTime);
      setBuffered(data.playableDuration);
      if (currentVideo) {
        updateProgress(
          currentVideo.id,
          data.currentTime,
          data.seekableDuration,
          currentVideo.title,
          currentVideo.thumbnailUri,
        );
      }
    },
    [currentVideo, setPosition, setBuffered, updateProgress],
  );

  const onBuffer = useCallback(
    (data: OnBufferData) => {
      setBuffering(data.isBuffering);
    },
    [setBuffering],
  );

  const onError = useCallback(
    (data: OnVideoErrorData) => {
      setError(data.error?.errorString ?? 'Playback error');
      setPlaying(false);
    },
    [setError, setPlaying],
  );

  const onEnd = useCallback(() => {
    setPlaying(false);
  }, [setPlaying]);

  const handleSeek = useCallback((time: number) => {
    videoRef.current?.seek(time);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setPlaying(true);
  }, [setError, setPlaying]);

  if (!currentVideo) return null;

  const videoTrackSelection = selectedQualityTrack != null
    ? { type: 'resolution' as const, value: selectedQualityTrack }
    : undefined;

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreen]}>
      <KeepAwake />
      <Video
        ref={videoRef}
        source={{ uri: currentVideo.uri }}
        style={styles.video}
        paused={!isPlaying}
        rate={speed}
        resizeMode="contain"
        onLoad={onLoad}
        onProgress={onProgress}
        onBuffer={onBuffer}
        onError={onError}
        onEnd={onEnd}
        pictureInPicture={isPiP}
        playInBackground={isPiP}
        selectedVideoTrack={videoTrackSelection}
        progressUpdateInterval={250}
        repeat={false}
      />
      <GestureOverlay onSeek={handleSeek} />
      <PlayerControls onSeek={handleSeek} videoRef={videoRef} />
      {isBuffering && <BufferIndicator />}
      {error && <ErrorOverlay message={error} onRetry={handleRetry} />}
      <SubtitleOverlay />
      <AutoPlayNext />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
});
