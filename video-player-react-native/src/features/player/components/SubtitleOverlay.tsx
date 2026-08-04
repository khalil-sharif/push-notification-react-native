import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePlayerStore } from '../../../stores/playerStore';
import { findActiveCue } from '../../../utils/subtitles';

const FONT_SIZES = { small: 14, medium: 18, large: 24 } as const;

export function SubtitleOverlay() {
  const { subtitlesEnabled, subtitleCues, position, subtitleFontSize } = usePlayerStore();

  if (!subtitlesEnabled || subtitleCues.length === 0) return null;

  const cue = findActiveCue(subtitleCues, position);
  if (!cue) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.background}>
        <Text style={[styles.text, { fontSize: FONT_SIZES[subtitleFontSize] }]}>{cue.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  background: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
});
