import { MatchResult, Song, BackendMatchResponse, BackendErrorResponse } from '../types';

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const REQUEST_COOLDOWN = 10000; // 10 seconds (matches backend rate limiting)

// Generate a unique client ID for user tracking (stored in localStorage)
const getClientId = (): string => {
  let clientId = localStorage.getItem('soundwave_client_id');
  if (!clientId) {
    clientId = 'client_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('soundwave_client_id', clientId);
  }
  return clientId;
};

// Convert backend response to frontend format
const convertBackendResponseToSong = (backendResponse: BackendMatchResponse): Song => {
  const { metadata, score, offset_seconds, youtube_playback_url } = backendResponse;
  
  // Get primary artist (or first artist if no primary)
  const primaryArtist = metadata.artists.find(a => a.role === 'primary') || metadata.artists[0];
  const artistName = primaryArtist?.artist_name || metadata.album_main_artist || 'Unknown Artist';
  
  // Create a placeholder artwork URL (you can enhance this later)
  const artworkUrl = `https://img.youtube.com/vi/${metadata.youtube_id}/maxresdefault.jpg`;
  
  return {
    id: metadata.song_id.toString(),
    title: metadata.song_title,
    artist: artistName,
    album: metadata.album_title || 'Unknown Album',
    artwork: artworkUrl,
    confidence: score / 1000, // Convert score to 0-1 range (adjust as needed)
    offset: Math.round(offset_seconds),
    duration: metadata.duration_seconds || 0,
    youtubeUrl: youtube_playback_url || undefined,
    spotifyUrl: metadata.song_url || undefined,
    artists: metadata.artists,
  };
};

export class MusicIdentificationAPI {
  private lastRequestTime = 0;

  async identifyMusic(audioBlob: Blob): Promise<MatchResult> {
    const now = Date.now();
    
    // Rate limiting check
    if (now - this.lastRequestTime < REQUEST_COOLDOWN) {
      return {
        success: false,
        error: 'Please wait before trying again',
        processingTime: 0
      };
    }

    this.lastRequestTime = now;
    const startTime = Date.now();

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'audio_sample.wav');

      // Make API request
      const response = await fetch(`${API_BASE_URL}/api/v1/match`, {
        method: 'POST',
        headers: {
          'X-Client-ID': getClientId(),
        },
        body: formData,
      });

      const processingTime = Date.now() - startTime;

      if (response.ok) {
        // Success response
        const backendResponse: BackendMatchResponse = await response.json();
        
        console.log('✅ Backend Response:', backendResponse); // For debugging
        
        const song = convertBackendResponseToSong(backendResponse);
        
        return {
          success: true,
          song,
          processingTime
        };
      } else {
        // Error response
        const errorResponse: BackendErrorResponse = await response.json();
        
        console.log('❌ Backend Error:', errorResponse); // For debugging
        
        return {
          success: false,
          error: errorResponse.error || 'Unknown error occurred',
          processingTime
        };
      }

    } catch (error) {
      console.error('🔴 Network Error:', error);
      
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        processingTime: Date.now() - startTime
      };
    }
  }

  canMakeRequest(): boolean {
    return Date.now() - this.lastRequestTime >= REQUEST_COOLDOWN;
  }

  getTimeUntilNextRequest(): number {
    const timePassed = Date.now() - this.lastRequestTime;
    return Math.max(0, REQUEST_COOLDOWN - timePassed);
  }
}

export const musicAPI = new MusicIdentificationAPI();