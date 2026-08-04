import type { SubtitleCue } from '../types/video';

function parseTimestamp(ts: string): number {
  const parts = ts.trim().replace(',', '.').split(':');
  if (parts.length === 3) {
    return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
  }
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
  }
  return parseFloat(parts[0]);
}

export function parseSRT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;
    const timeLine = lines[1];
    const match = timeLine.match(/(\S+)\s*-->\s*(\S+)/);
    if (!match) continue;
    const start = parseTimestamp(match[1]);
    const end = parseTimestamp(match[2]);
    const text = lines
      .slice(2)
      .join('\n')
      .replace(/<[^>]+>/g, '');
    cues.push({ start, end, text });
  }
  return cues;
}

export function parseVTT(content: string): SubtitleCue[] {
  const body = content.replace(/^WEBVTT.*\n/i, '');
  return parseSRT(body);
}

export function parseSubtitles(content: string, type: 'srt' | 'vtt'): SubtitleCue[] {
  return type === 'vtt' ? parseVTT(content) : parseSRT(content);
}

export function findActiveCue(cues: SubtitleCue[], time: number): SubtitleCue | null {
  for (const cue of cues) {
    if (time >= cue.start && time <= cue.end) {
      return cue;
    }
  }
  return null;
}
