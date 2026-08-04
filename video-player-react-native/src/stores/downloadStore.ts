import { create } from 'zustand';
import RNFS from 'react-native-fs';
import type { DownloadEntry } from '../types/video';
import { getJSON, setJSON } from '../utils/storage';

const DOWNLOADS_KEY = 'downloads';

interface DownloadState {
  downloads: DownloadEntry[];
  loadDownloads: () => void;
  startDownload: (videoId: string, uri: string, title: string, thumbnailUri?: string) => Promise<void>;
  deleteDownload: (videoId: string) => Promise<void>;
  getDownload: (videoId: string) => DownloadEntry | undefined;
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  downloads: getJSON<DownloadEntry[]>(DOWNLOADS_KEY) ?? [],

  loadDownloads: () => {
    const downloads = getJSON<DownloadEntry[]>(DOWNLOADS_KEY) ?? [];
    set({ downloads });
  },

  startDownload: async (videoId, uri, title, thumbnailUri) => {
    const dir = `${RNFS.DocumentDirectoryPath}/downloads`;
    await RNFS.mkdir(dir);
    const ext = uri.split('.').pop()?.split('?')[0] ?? 'mp4';
    const filePath = `${dir}/${videoId}.${ext}`;

    const entry: DownloadEntry = {
      videoId,
      filePath,
      downloadedAt: Date.now(),
      size: 0,
      title,
      thumbnailUri,
      progress: 0,
      status: 'downloading',
    };

    const { downloads } = get();
    const updated = [...downloads.filter((d) => d.videoId !== videoId), entry];
    set({ downloads: updated });
    setJSON(DOWNLOADS_KEY, updated);

    try {
      const result = RNFS.downloadFile({
        fromUrl: uri,
        toFile: filePath,
        progress: (res) => {
          const progress = res.bytesWritten / res.contentLength;
          const current = get().downloads.map((d) =>
            d.videoId === videoId ? { ...d, progress, size: res.contentLength } : d,
          );
          set({ downloads: current });
        },
        progressInterval: 500,
      });

      const res = await result.promise;
      const final = get().downloads.map((d) =>
        d.videoId === videoId
          ? { ...d, progress: 1, status: 'completed' as const, size: res.bytesWritten, downloadedAt: Date.now() }
          : d,
      );
      set({ downloads: final });
      setJSON(DOWNLOADS_KEY, final);
    } catch {
      const failed = get().downloads.map((d) =>
        d.videoId === videoId ? { ...d, status: 'failed' as const } : d,
      );
      set({ downloads: failed });
      setJSON(DOWNLOADS_KEY, failed);
    }
  },

  deleteDownload: async (videoId) => {
    const entry = get().downloads.find((d) => d.videoId === videoId);
    if (entry) {
      try {
        await RNFS.unlink(entry.filePath);
      } catch {
        // file may not exist
      }
    }
    const filtered = get().downloads.filter((d) => d.videoId !== videoId);
    set({ downloads: filtered });
    setJSON(DOWNLOADS_KEY, filtered);
  },

  getDownload: (videoId) => get().downloads.find((d) => d.videoId === videoId),
}));
