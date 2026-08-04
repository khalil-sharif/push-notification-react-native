import { create } from 'zustand';
import type { VideoItem, WatchHistoryEntry } from '../types/video';
import { getJSON, setJSON } from '../utils/storage';

const HISTORY_KEY = 'watch_history';

interface LibraryState {
  videos: VideoItem[];
  watchHistory: WatchHistoryEntry[];
  setVideos: (videos: VideoItem[]) => void;
  updateProgress: (videoId: string, position: number, duration: number, title: string, thumbnailUri?: string) => void;
  getLastPosition: (videoId: string) => number;
  getContinueWatching: () => WatchHistoryEntry[];
  loadHistory: () => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  videos: [],
  watchHistory: getJSON<WatchHistoryEntry[]>(HISTORY_KEY) ?? [],

  setVideos: (videos) => set({ videos }),

  updateProgress: (videoId, position, duration, title, thumbnailUri) => {
    const { watchHistory } = get();
    const existing = watchHistory.findIndex((e) => e.videoId === videoId);
    const entry: WatchHistoryEntry = {
      videoId,
      lastPosition: position,
      duration,
      lastWatched: Date.now(),
      title,
      thumbnailUri,
    };

    let updated: WatchHistoryEntry[];
    if (existing >= 0) {
      updated = [...watchHistory];
      updated[existing] = entry;
    } else {
      updated = [entry, ...watchHistory];
    }

    setJSON(HISTORY_KEY, updated);
    set({ watchHistory: updated });
  },

  getLastPosition: (videoId) => {
    const entry = get().watchHistory.find((e) => e.videoId === videoId);
    return entry?.lastPosition ?? 0;
  },

  getContinueWatching: () => {
    return get()
      .watchHistory.filter((e) => e.lastPosition > 0 && e.lastPosition < e.duration * 0.95)
      .sort((a, b) => b.lastWatched - a.lastWatched)
      .slice(0, 10);
  },

  loadHistory: () => {
    const history = getJSON<WatchHistoryEntry[]>(HISTORY_KEY) ?? [];
    set({ watchHistory: history });
  },
}));
