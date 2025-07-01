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

// Parse artist JSON string
const parseArtistName = (artistString: string): string => {
  try {
    // Handle cases where artist_name is a JSON string
    if (artistString.startsWith('{"artist_name"')) {
      const parsed = JSON.parse(artistString);
      return parsed.artist_name;
    }
    return artistString;
  } catch {
    return artistString;
  }
};

// Convert backend response to frontend format
const convertBackendResponseToSong = (backendResponse: BackendMatchResponse): Song => {
  const { metadata, score, offset_seconds, offset_formatted, youtube_playback_url } = backendResponse;
  
  // Parse primary artists and get display name
  const primaryArtists = metadata.artists
    .filter(a => a.role === 'primary')
    .map(a => parseArtistName(a.artist_name));
  
  const artistName = primaryArtists.length > 0 
    ? primaryArtists.join(' & ') 
    : metadata.album_main_artist || 'Unknown Artist';
  
  // Use YouTube ID directly from metadata
  const artworkUrl = metadata.youtube_id 
    ? `https://img.youtube.com/vi/${metadata.youtube_id}/maxresdefault.jpg`
    : `https://via.placeholder.com/480x480/1a1a2e/ffffff?text=${encodeURIComponent(metadata.song_title)}`;
  
  // Generate shareable URL
  const roundedOffset = Math.round(offset_seconds);
  const shareableUrl = `${window.location.origin}/song/${metadata.song_id}?t=${roundedOffset}`;
  
  return {
    id: metadata.song_id.toString(),
    title: metadata.song_title,
    artist: artistName,
    album: metadata.album_title || 'Unknown Album',
    artwork: artworkUrl,
    confidence: score / 1000, // Convert score to 0-1 range
    offset: Math.round(offset_seconds),
    offsetFormatted: offset_formatted || '0:00',
    duration: metadata.duration_seconds || 0,
    popularity: metadata.track_popularity,
    youtubeUrl: metadata.youtube_url || undefined,
    youtubePlaybackUrl: youtube_playback_url || undefined,
    shareableUrl: shareableUrl,
    spotifyUrl: metadata.spotify_url || undefined,
    appleMusicUrl: metadata.apple_music_url || undefined,
    artists: metadata.artists,
    genres: metadata.genres || [],
  };
};

export class MusicIdentificationAPI {
  private lastRequestTime = 0;

  async getSongMetadata(songId: number): Promise<MatchResult> {
    const startTime = Date.now();

    try {
      // Make API request to get song metadata
      const response = await fetch(`${API_BASE_URL}/song/${songId}`, {
        method: 'GET',
        headers: {
          'X-Client-ID': getClientId(),
        },
      });

      const processingTime = Date.now() - startTime;

      if (response.ok) {
        // Success response - transform SongMetadata to BackendMatchResponse format
        const metadata = await response.json();
        
        // console.log('✅ Song Metadata Response:', metadata); // For debugging
        
        // Create a mock BackendMatchResponse from SongMetadata
        const backendResponse: BackendMatchResponse = {
          match_found: true,
          score: 1000, // Max confidence for direct metadata lookup
          offset_seconds: 0, // Default to start of song
          offset_formatted: "0:00",
          processing_time: processingTime,
          youtube_playback_url: metadata.youtube_url,
          metadata: metadata
        };
        
        const song = convertBackendResponseToSong(backendResponse);
        
        return {
          success: true,
          song,
          processingTime
        };
      } else {
        // Error response
        const errorResponse = await response.json();
        
        // console.log('❌ Song Metadata Error:', errorResponse); // For debugging
        
        return {
          success: false,
          error: errorResponse.error || 'Song not found',
          processingTime
        };
      }

    } catch (error) {
      // console.error('🔴 Network Error:', error);
      
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        processingTime: Date.now() - startTime
      };
    }
  }

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
        
        // console.log('✅ Backend Response:', backendResponse); // For debugging
        
        const song = convertBackendResponseToSong(backendResponse);
        
        return {
          success: true,
          song,
          processingTime
        };
      } else {
        // Error response
        const errorResponse: BackendErrorResponse = await response.json();
        
        // console.log('❌ Backend Error:', errorResponse); // For debugging
        
        return {
          success: false,
          error: errorResponse.error || 'Unknown error occurred',
          processingTime
        };
      }

    } catch (error) {
      // console.error('🔴 Network Error:', error);
      
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