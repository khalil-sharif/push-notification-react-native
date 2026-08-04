import React, { useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/Navigation';
import { useDownloadStore } from '../../../stores/downloadStore';
import { usePlayerStore } from '../../../stores/playerStore';
import { colors } from '../../../theme/colors';
import type { DownloadEntry } from '../../../types/video';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Downloads'>;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function DownloadsScreen() {
  const navigation = useNavigation<Nav>();
  const { downloads, loadDownloads, deleteDownload } = useDownloadStore();
  const setVideo = usePlayerStore((s) => s.setVideo);

  useEffect(() => {
    loadDownloads();
  }, [loadDownloads]);

  const playOffline = useCallback(
    (entry: DownloadEntry) => {
      if (entry.status !== 'completed') return;
      setVideo({
        id: entry.videoId,
        title: entry.title,
        uri: `file://${entry.filePath}`,
        thumbnailUri: entry.thumbnailUri,
        duration: 0,
      });
      navigation.navigate('Player', { videoId: entry.videoId });
    },
    [navigation, setVideo],
  );

  const confirmDelete = useCallback(
    (entry: DownloadEntry) => {
      Alert.alert('Delete Download', `Remove "${entry.title}" from downloads?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteDownload(entry.videoId) },
      ]);
    },
    [deleteDownload],
  );

  const renderItem = useCallback(
    ({ item }: { item: DownloadEntry }) => (
      <TouchableOpacity
        style={styles.item}
        onPress={() => playOffline(item)}
        onLongPress={() => confirmDelete(item)}
      >
        {item.thumbnailUri ? (
          <Image source={{ uri: item.thumbnailUri }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholder]} />
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.meta}>
            {item.status === 'completed'
              ? formatBytes(item.size)
              : item.status === 'downloading'
                ? `${Math.round(item.progress * 100)}%`
                : item.status === 'failed'
                  ? 'Failed'
                  : 'Pending'}
          </Text>
          {item.status === 'downloading' && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteBtn}>
          <Text style={styles.deleteIcon}>🗑</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [playOffline, confirmDelete],
  );

  return (
    <View style={styles.container}>
      {downloads.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No downloads yet</Text>
          <Text style={styles.emptySubtext}>Downloaded videos will appear here for offline playback</Text>
        </View>
      ) : (
        <FlatList
          data={downloads}
          renderItem={renderItem}
          keyExtractor={(item) => item.videoId}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    marginBottom: 8,
    padding: 10,
  },
  thumbnail: {
    width: 80,
    height: 45,
    borderRadius: 6,
    backgroundColor: colors.surfaceLight,
  },
  placeholder: {
    backgroundColor: colors.surfaceLight,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.trackBg,
    borderRadius: 1.5,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.accent,
  },
  deleteBtn: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
});
