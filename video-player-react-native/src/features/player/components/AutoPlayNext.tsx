import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { usePlayerStore } from '../../../stores/playerStore';
import { colors } from '../../../theme/colors';

export function AutoPlayNext() {
  const { isPlaying, position, duration, playlist, currentIndex, playNext } = usePlayerStore();
  const [countdown, setCountdown] = useState(5);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const nextVideo = currentIndex >= 0 && currentIndex < playlist.length - 1 ? playlist[currentIndex + 1] : null;
  const ended = !isPlaying && duration > 0 && position >= duration - 0.5;

  useEffect(() => {
    if (ended && nextVideo) {
      setVisible(true);
      setCountdown(5);
      timerRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            playNext();
            setVisible(false);
            return 5;
          }
          return c - 1;
        });
      }, 1000);
    } else {
      setVisible(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ended, nextVideo, playNext]);

  const cancel = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setVisible(false);
  }, []);

  const playNow = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    playNext();
    setVisible(false);
  }, [playNext]);

  if (!visible || !nextVideo) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {nextVideo.thumbnailUri && (
          <Image source={{ uri: nextVideo.thumbnailUri }} style={styles.thumbnail} />
        )}
        <View style={styles.info}>
          <Text style={styles.label}>Next in {countdown}s</Text>
          <Text style={styles.title} numberOfLines={1}>{nextVideo.title}</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={playNow} style={styles.playBtn}>
            <Text style={styles.playText}>Play Now</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={cancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 45,
    borderRadius: 6,
    backgroundColor: colors.surfaceLight,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 14,
    marginTop: 2,
  },
  buttons: {
    marginLeft: 8,
  },
  playBtn: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
  },
  playText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
