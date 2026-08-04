import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { usePlayerStore } from '../../../stores/playerStore';
import { colors } from '../../../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function QualitySelector({ visible, onClose }: Props) {
  const { qualityTracks, selectedQualityTrack, setSelectedQualityTrack } = usePlayerStore();

  const select = (trackId: number | null) => {
    setSelectedQualityTrack(trackId);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1}>
        <View style={styles.sheet}>
          <Text style={styles.header}>Video Quality</Text>
          <TouchableOpacity style={styles.option} onPress={() => select(null)}>
            <Text style={[styles.optionText, selectedQualityTrack === null && styles.selected]}>Auto</Text>
            {selectedQualityTrack === null && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
          {qualityTracks.map((track) => (
            <TouchableOpacity key={track.trackId} style={styles.option} onPress={() => select(track.height)}>
              <Text style={[styles.optionText, selectedQualityTrack === track.height && styles.selected]}>
                {track.height}p
              </Text>
              {selectedQualityTrack === track.height && <Text style={styles.check}>✓</Text>}
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
