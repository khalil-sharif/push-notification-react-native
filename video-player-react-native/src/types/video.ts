export interface VideoItem {
  id: string;
  title: string;
  uri: string;
  thumbnailUri?: string;
  duration: number;
  subtitles?: SubtitleTrack[];
}

export interface SubtitleTrack {
  language: string;
  label: string;
  uri: string;
  type: 'srt' | 'vtt';
}

export interface WatchHistoryEntry {
  videoId: string;
  lastPosition: number;
  duration: number;
  lastWatched: number;
  title: string;
  thumbnailUri?: string;
}

export interface DownloadEntry {
  videoId: string;
  filePath: string;
  downloadedAt: number;
  size: number;
  title: string;
  thumbnailUri?: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
}

export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export interface VideoQualityTrack {
  width: number;
  height: number;
  bitrate: number;
  trackId: number;
}
