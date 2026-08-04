import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { usePlayerStore } from '../../../stores/playerStore';
import type { PlaybackSpeed } from '../../../types/video';
import { colors } from '../../../theme/colors';

const SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SpeedSelector({ visible, onClose }: Props) {
  const { speed, setSpeed } = usePlayerStore();

  const select = (s: PlaybackSpeed) => {
    setSpeed(s);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1}>
        <View style={styles.sheet}>
          <Text style={styles.header}>Playback Speed</Text>
          {SPEEDS.map((s) => (
            <TouchableOpacity key={s} style={styles.option} onPress={() => select(s)}>
              <Text style={[styles.optionText, s === speed && styles.selected]}>{s}x</Text>
              {s === speed && <Text style={styles.check}>✓</Text>}
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
