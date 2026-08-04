import { create } from 'zustand';
import type { PlaybackSpeed, VideoItem, VideoQualityTrack, SubtitleCue } from '../types/video';
import { getJSON, setJSON } from '../utils/storage';

interface PlayerState {
  currentVideo: VideoItem | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  buffered: number;
  speed: PlaybackSpeed;
  isFullscreen: boolean;
  isMiniPlayer: boolean;
  isPiP: boolean;
  subtitlesEnabled: boolean;
  subtitleFontSize: 'small' | 'medium' | 'large';
  selectedSubtitleLanguage: string | null;
  subtitleCues: SubtitleCue[];
  qualityTracks: VideoQualityTrack[];
  selectedQualityTrack: number | null;
  isBuffering: boolean;
  error: string | null;
  controlsVisible: boolean;
  playlist: VideoItem[];
  currentIndex: number;

  setVideo: (video: VideoItem, playlist?: VideoItem[], index?: number) => void;
  setPlaying: (playing: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setBuffered: (buffered: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  setFullscreen: (fs: boolean) => void;
  setMiniPlayer: (mini: boolean) => void;
  setPiP: (pip: boolean) => void;
  setSubtitlesEnabled: (enabled: boolean) => void;
  setSubtitleFontSize: (size: 'small' | 'medium' | 'large') => void;
  setSelectedSubtitleLanguage: (lang: string | null) => void;
  setSubtitleCues: (cues: SubtitleCue[]) => void;
  setQualityTracks: (tracks: VideoQualityTrack[]) => void;
  setSelectedQualityTrack: (trackId: number | null) => void;
  setBuffering: (buffering: boolean) => void;
  setError: (error: string | null) => void;
  setControlsVisible: (visible: boolean) => void;
  playNext: () => VideoItem | null;
  reset: () => void;
}

const SPEED_KEY = 'playback_speed';

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentVideo: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  buffered: 0,
  speed: (getJSON<PlaybackSpeed>(SPEED_KEY) ?? 1) as PlaybackSpeed,
  isFullscreen: false,
  isMiniPlayer: false,
  isPiP: false,
  subtitlesEnabled: false,
  subtitleFontSize: 'medium',
  selectedSubtitleLanguage: null,
  subtitleCues: [],
  qualityTracks: [],
  selectedQualityTrack: null,
  isBuffering: false,
  error: null,
  controlsVisible: true,
  playlist: [],
  currentIndex: -1,

  setVideo: (video, playlist, index) =>
    set({
      currentVideo: video,
      isPlaying: true,
      position: 0,
      duration: 0,
      buffered: 0,
      error: null,
      isMiniPlayer: false,
      subtitleCues: [],
      qualityTracks: [],
      selectedQualityTrack: null,
      playlist: playlist ?? [],
      currentIndex: index ?? -1,
    }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setBuffered: (buffered) => set({ buffered }),
  setSpeed: (speed) => {
    setJSON(SPEED_KEY, speed);
    set({ speed });
  },
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setMiniPlayer: (isMiniPlayer) => set({ isMiniPlayer }),
  setPiP: (isPiP) => set({ isPiP }),
  setSubtitlesEnabled: (subtitlesEnabled) => set({ subtitlesEnabled }),
  setSubtitleFontSize: (subtitleFontSize) => set({ subtitleFontSize }),
  setSelectedSubtitleLanguage: (selectedSubtitleLanguage) => set({ selectedSubtitleLanguage }),
  setSubtitleCues: (subtitleCues) => set({ subtitleCues }),
  setQualityTracks: (qualityTracks) => set({ qualityTracks }),
  setSelectedQualityTrack: (selectedQualityTrack) => set({ selectedQualityTrack }),
  setBuffering: (isBuffering) => set({ isBuffering }),
  setError: (error) => set({ error }),
  setControlsVisible: (controlsVisible) => set({ controlsVisible }),
  playNext: () => {
    const { playlist, currentIndex } = get();
    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
      const next = playlist[nextIndex];
      set({
        currentVideo: next,
        currentIndex: nextIndex,
        isPlaying: true,
        position: 0,
        duration: 0,
        buffered: 0,
        error: null,
        subtitleCues: [],
      });
      return next;
    }
    return null;
  },
  reset: () =>
    set({
      currentVideo: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      buffered: 0,
      isFullscreen: false,
      isMiniPlayer: false,
      isPiP: false,
      error: null,
      controlsVisible: true,
      subtitleCues: [],
      qualityTracks: [],
      selectedQualityTrack: null,
      playlist: [],
      currentIndex: -1,
    }),
}));
