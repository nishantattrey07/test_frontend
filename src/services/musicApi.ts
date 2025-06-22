import { MatchResult, Song } from '../types';

// Mock songs database for demonstration
const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    artwork: 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
    confidence: 0.96,
    offset: 23,
    duration: 200,
    previewUrl: '#',
    spotifyUrl: '#',
    appleUrl: '#'
  },
  {
    id: '2',
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    album: 'Fine Line',
    artwork: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
    confidence: 0.94,
    offset: 15,
    duration: 174,
    previewUrl: '#',
    spotifyUrl: '#',
    appleUrl: '#'
  },
  {
    id: '3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    artwork: 'https://images.pexels.com/photos/1749303/pexels-photo-1749303.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
    confidence: 0.92,
    offset: 8,
    duration: 203,
    previewUrl: '#',
    spotifyUrl: '#',
    appleUrl: '#'
  },
  {
    id: '4',
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    album: 'SOUR',
    artwork: 'https://images.pexels.com/photos/1655166/pexels-photo-1655166.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
    confidence: 0.89,
    offset: 31,
    duration: 178,
    previewUrl: '#',
    spotifyUrl: '#',
    appleUrl: '#'
  },
  {
    id: '5',
    title: 'Stay',
    artist: 'The Kid LAROI, Justin Bieber',
    album: 'F*CK LOVE 3: OVER YOU',
    artwork: 'https://images.pexels.com/photos/1002638/pexels-photo-1002638.jpeg?auto=compress&cs=tinysrgb&w=300&h=300',
    confidence: 0.97,
    offset: 12,
    duration: 141,
    previewUrl: '#',
    spotifyUrl: '#',
    appleUrl: '#'
  }
];

let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 6;
const REQUEST_COOLDOWN = 10000; // 10 seconds

export class MusicIdentificationAPI {
  private lastRequestTime = 0;

  async identifyMusic(audioBlob: Blob): Promise<MatchResult> {
    const now = Date.now();
    
    // Rate limiting
    if (now - this.lastRequestTime < REQUEST_COOLDOWN) {
      return {
        success: false,
        error: 'Please wait before trying again',
        processingTime: 0
      };
    }

    this.lastRequestTime = now;
    requestCount++;

    const startTime = Date.now();

    try {
      // Simulate API processing time (2-4 seconds)
      const processingTime = Math.random() * 2000 + 2000;
      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;
      
      if (!success) {
        return {
          success: false,
          error: 'Could not identify the song. Try getting closer to the audio source.',
          processingTime: Date.now() - startTime
        };
      }

      // Return a random song from our mock database
      const randomSong = MOCK_SONGS[Math.floor(Math.random() * MOCK_SONGS.length)];
      
      // Add some randomness to confidence and offset
      const song: Song = {
        ...randomSong,
        confidence: Math.max(0.85, Math.random() * 0.15 + 0.85),
        offset: Math.floor(Math.random() * 60)
      };

      return {
        success: true,
        song,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
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