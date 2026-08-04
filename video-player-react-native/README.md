# Video Player React Native

A production-ready video player built with React Native 0.76+, featuring HLS/MP4 playback, custom gesture-based controls, PiP, downloads, and a mini player.

## Features

- **Video Playback** — HLS & MP4 via `react-native-video` 6.x with buffering indicator and error retry
- **Custom Controls** — Auto-hiding overlay with play/pause, seekbar, fullscreen, PiP, speed selector
- **Gesture Controls** — Double-tap rewind/forward (±10s) with animated indicators
- **Custom Seekbar** — Played/buffered/total tracks, draggable thumb with time tooltip via Gesture Handler
- **Playback Speed** — Bottom sheet selector (0.5x–2x), persisted via MMKV
- **Quality Selection** — HLS track picker for available resolutions
- **Subtitles** — SRT/VTT parser, overlay with font size options (S/M/L), language selection
- **Picture-in-Picture** — Native PiP support on both platforms
- **Mini Player** — Collapsed bar with swipe-to-dismiss, maintains playback on navigation
- **Video Library** — Grid layout with thumbnails, duration badges, progress bars
- **Continue Watching** — Horizontal scroll of in-progress videos, resume from last position
- **Downloads** — Download videos for offline playback, progress tracking, delete management
- **Auto-Play Next** — Countdown overlay with cancel/play-now for playlist progression
- **Orientation Lock** — Auto landscape in fullscreen, portrait on exit
- **Keep Awake** — Screen stays on during playback

## Architecture

```
src/
├── data/               # Sample video catalog
├── features/
│   ├── player/
│   │   ├── screens/    # PlayerScreen
│   │   └── components/ # Controls, SeekBar, Gestures, MiniPlayer, Selectors
│   ├── library/
│   │   └── screens/    # LibraryScreen with grid + continue watching
│   └── downloads/
│       └── screens/    # DownloadsScreen with offline playback
├── navigation/         # React Navigation stack
├── stores/             # Zustand stores (player, library, downloads)
├── theme/              # Color palette
├── types/              # TypeScript interfaces
└── utils/              # Time formatting, subtitle parsing, MMKV storage
```

## Tech Stack

| Library | Purpose |
|---|---|
| react-native-video 6.x | Video playback (HLS/MP4) |
| react-native-reanimated 3 | Animated controls, seekbar, mini player |
| react-native-gesture-handler | Seekbar dragging, double-tap seek, swipe dismiss |
| zustand | State management |
| react-native-mmkv | Watch history & download persistence |
| react-native-fs | File downloads for offline playback |
| react-native-orientation-locker | Fullscreen landscape lock |
| react-native-keep-awake | Prevent screen sleep |
| react-native-safe-area-context | Safe area insets |

## Setup

```bash
# Install dependencies
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## PiP Configuration

### iOS
Add to `Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
```

### Android
Add to `AndroidManifest.xml` on your main activity:
```xml
android:supportsPictureInPicture="true"
android:configChanges="screenSize|smallestScreenSize|screenLayout|orientation"
```

## Subtitle Format Guide

### SRT
```
1
00:00:01,000 --> 00:00:04,000
Hello, welcome to the video.

2
00:00:05,000 --> 00:00:08,000
This is the second subtitle.
```

### VTT
```
WEBVTT

00:00:01.000 --> 00:00:04.000
Hello, welcome to the video.

00:00:05.000 --> 00:00:08.000
This is the second subtitle.
```

Pass subtitle tracks in the video item's `subtitles` array:
```ts
{
  id: 'my-video',
  title: 'My Video',
  uri: 'https://example.com/video.mp4',
  duration: 120,
  subtitles: [
    { language: 'en', label: 'English', uri: 'https://example.com/subs-en.vtt', type: 'vtt' },
    { language: 'es', label: 'Spanish', uri: 'https://example.com/subs-es.srt', type: 'srt' },
  ]
}
```

## State Management

Three Zustand stores manage the app:

- **playerStore** — Current video, playback state, speed, quality, subtitles, controls visibility, playlist
- **libraryStore** — Video catalog, watch history (MMKV-persisted), continue watching logic
- **downloadStore** — Download queue, progress tracking, file management (MMKV + RNFS)

## License

MIT
