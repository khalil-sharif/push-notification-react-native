import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { usePlayerStore } from '../../../stores/playerStore';
import { colors } from '../../../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const FONT_SIZES: Array<{ label: string; value: 'small' | 'medium' | 'large' }> = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

export function SubtitleSelector({ visible, onClose }: Props) {
  const {
    currentVideo,
    subtitlesEnabled,
    selectedSubtitleLanguage,
    subtitleFontSize,
    setSubtitlesEnabled,
    setSelectedSubtitleLanguage,
    setSubtitleFontSize,
  } = usePlayerStore();

  const tracks = currentVideo?.subtitles ?? [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1}>
        <View style={styles.sheet}>
          <Text style={styles.header}>Subtitles</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              setSubtitlesEnabled(!subtitlesEnabled);
            }}
          >
            <Text style={styles.optionText}>{subtitlesEnabled ? 'Disable' : 'Enable'} Subtitles</Text>
          </TouchableOpacity>

          {tracks.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Language</Text>
              {tracks.map((track) => (
                <TouchableOpacity
                  key={track.language}
                  style={styles.option}
                  onPress={() => {
                    setSelectedSubtitleLanguage(track.language);
                    setSubtitlesEnabled(true);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedSubtitleLanguage === track.language && styles.selected,
                    ]}
                  >
                    {track.label}
                  </Text>
                  {selectedSubtitleLanguage === track.language && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              ))}
            </>
          )}

          <Text style={styles.sectionHeader}>Font Size</Text>
          {FONT_SIZES.map((size) => (
            <TouchableOpacity
              key={size.value}
              style={styles.option}
              onPress={() => setSubtitleFontSize(size.value)}
            >
              <Text style={[styles.optionText, subtitleFontSize === size.value && styles.selected]}>
                {size.label}
              </Text>
              {subtitleFontSize === size.value && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionHeader: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceLight,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
  },
  selected: {
    color: colors.accent,
    fontWeight: '700',
  },
  check: {
    color: colors.accent,
    fontSize: 16,
  },
});
