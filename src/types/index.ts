export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  confidence: number;
  offset: number;
  duration: number;
  previewUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
}

export interface MatchResult {
  success: boolean;
  song?: Song;
  error?: string;
  processingTime: number;
}

export type AppState = 'initial' | 'recording' | 'processing' | 'result' | 'error';

export interface AudioVisualizationData {
  frequencies: number[];
  volume: number;
}