// Updated types to match your FastAPI backend response

export interface Artist {
  artist_name: string;
  role: string; // "primary", "featured", or "producer"
}

export interface SongMetadata {
  song_id: number;
  song_title: string;
  duration_seconds: number | null;
  youtube_id: string;
  song_url: string | null;
  album_title: string | null;
  album_main_artist: string | null;
  artists: Artist[];
}

// Backend response format
export interface BackendMatchResponse {
  match_found: boolean;
  score: number;
  offset_seconds: number;
  offset_formatted: string | null;
  processing_time: number;
  youtube_playback_url: string | null;
  metadata: SongMetadata;
}

// Error response format
export interface BackendErrorResponse {
  match_found: false;
  error: string;
  detail?: string;
}

// Frontend Song interface (converted from backend response)
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
  youtubeUrl?: string; // NEW: YouTube playback URL
  artists?: Artist[]; // NEW: Full artist list
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

// Toast notification types
export interface ToastData {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
}

// History and storage types
export interface MusicMatch {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
  confidence: number;
  timestamp: number;
  youtubeUrl: string;
  spotifyUrl?: string;
}