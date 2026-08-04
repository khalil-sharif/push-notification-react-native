import React, { useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/Navigation';
import { usePlayerStore } from '../../../stores/playerStore';
import { useLibraryStore } from '../../../stores/libraryStore';
import { sampleVideos } from '../../../data/sampleVideos';
import { formatTime } from '../../../utils/time';
import { colors } from '../../../theme/colors';
import type { VideoItem, WatchHistoryEntry } from '../../../types/video';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Library'>;

export function LibraryScreen() {
  const navigation = useNavigation<Nav>();
  const setVideo = usePlayerStore((s) => s.setVideo);
  const { watchHistory, setVideos, loadHistory, getContinueWatching } = useLibraryStore();

  useEffect(() => {
    setVideos(sampleVideos);
    loadHistory();
  }, [setVideos, loadHistory]);

  const continueWatching = getContinueWatching();

  const playVideo = useCallback(
    (video: VideoItem) => {
      setVideo(video, sampleVideos, sampleVideos.indexOf(video));
      navigation.navigate('Player', { videoId: video.id });
    },
    [navigation, setVideo],
  );

  const renderContinueItem = useCallback(
    ({ item }: { item: WatchHistoryEntry }) => {
      const video = sampleVideos.find((v) => v.id === item.videoId);
      if (!video) return null;
      const progress = item.duration > 0 ? item.lastPosition / item.duration : 0;

      return (
        <TouchableOpacity style={styles.continueCard} onPress={() => playVideo(video)}>
          {video.thumbnailUri ? (
            <Image source={{ uri: video.thumbnailUri }} style={styles.continueThumbnail} />
          ) : (
            <View style={[styles.continueThumbnail, styles.placeholder]} />
          )}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.continueTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </TouchableOpacity>
      );
    },
    [playVideo],
  );

  const renderVideoItem = useCallback(
    ({ item }: { item: VideoItem }) => {
      const history = watchHistory.find((h) => h.videoId === item.id);
      const progress = history && history.duration > 0 ? history.lastPosition / history.duration : 0;

      return (
        <TouchableOpacity style={styles.videoItem} onPress={() => playVideo(item)}>
          {item.thumbnailUri ? (
            <Image source={{ uri: item.thumbnailUri }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.placeholder]} />
          )}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatTime(item.duration)}</Text>
          </View>
          {progress > 0 && (
            <View style={styles.itemProgress}>
              <View style={[styles.itemProgressFill, { width: `${progress * 100}%` }]} />
            </View>
          )}
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [playVideo, watchHistory],
  );

  const header = useCallback(
    () => (
      <View>
        {continueWatching.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue Watching</Text>
            <FlatList
              data={continueWatching}
              renderItem={renderContinueItem}
              keyExtractor={(item) => `continue-${item.videoId}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.continueList}
            />
          </View>
        )}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>All Videos</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Downloads')}>
            <Text style={styles.downloadsLink}>Downloads</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [continueWatching, navigation, renderContinueItem],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sampleVideos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingBottom: 80,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  downloadsLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  continueList: {
    paddingHorizontal: 12,
  },
  continueCard: {
    width: 160,
    marginHorizontal: 4,
  },
  continueThumbnail: {
    width: 160,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.trackBg,
    marginTop: -3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.accent,
  },
  continueTitle: {
    color: colors.text,
    fontSize: 13,
    marginTop: 6,
  },
  row: {
    paddingHorizontal: 12,
  },
  videoItem: {
    flex: 1,
    margin: 4,
    maxWidth: '50%',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
  },
  placeholder: {
    backgroundColor: colors.surfaceLight,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 40,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  durationText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  itemProgress: {
    height: 3,
    backgroundColor: colors.trackBg,
    marginTop: -3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  itemProgressFill: {
    height: 3,
    backgroundColor: colors.accent,
  },
  videoInfo: {
    paddingVertical: 6,
  },
  videoTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
