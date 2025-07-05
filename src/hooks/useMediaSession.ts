// Lazy Media Session hook with minimal overhead
// Only initializes when song exists and avoids heavy operations

import { useEffect, useState, useCallback } from 'react';
import { Song, AppState, EarbudPreferences } from '../types';
import { PreparedUrls, launchYouTubeMusic } from '../utils/musicLauncher';

interface MediaSessionState {
  isSupported: boolean;
  isSetup: boolean;
  error: string | null;
}

interface UseMediaSessionResult {
  setupMediaSession: () => void;
  clearMediaSession: () => void;
  updatePlaybackState: (state: 'playing' | 'paused' | 'none') => void;
  isSupported: boolean;
  isSetup: boolean;
}

/**
 * High-performance Media Session hook with lazy initialization and earbud gesture support
 * Only sets up when explicitly called to avoid overhead during recording/processing
 */
export const useMediaSession = (
  song: Song | null,
  preparedUrls: PreparedUrls | null = null,
  onStartDiscovery?: () => void,
  appState?: AppState,
  earbudPreferences?: EarbudPreferences
): UseMediaSessionResult => {
  const [state, setState] = useState<MediaSessionState>({
    isSupported: 'mediaSession' in navigator,
    isSetup: false,
    error: null
  });

  // Fast setup with minimal operations
  const setupMediaSession = useCallback(() => {
    if (!song || state.isSetup || !state.isSupported) return;

    try {
      // Minimal metadata setup - avoid heavy operations
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album,
        artwork: song.artwork ? [{ 
          src: song.artwork, 
          sizes: '512x512', 
          type: 'image/png' 
        }] : undefined
      });

      // Fast action handlers using pre-built URLs
      navigator.mediaSession.setActionHandler('play', () => {
        if (preparedUrls) {
          launchYouTubeMusic(preparedUrls);
        } else if (song.youtubePlaybackUrl) {
          window.open(song.youtubePlaybackUrl, '_blank');
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        // Update playback state to paused
        navigator.mediaSession.playbackState = 'paused';
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        // Clear the session
        navigator.mediaSession.playbackState = 'none';
        navigator.mediaSession.metadata = null;
        setState(prev => ({ ...prev, isSetup: false }));
      });

      // Earbud gesture handler for music discovery
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        // Only trigger discovery when on initial screen and feature is enabled
        if (appState === 'initial' && earbudPreferences?.enabled && onStartDiscovery) {
          onStartDiscovery();
        }
        // For other states or when disabled, ignore the gesture
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        // Reserved for future implementation
        // Could be used for other earbud gestures
      });

      // Set initial playback state
      navigator.mediaSession.playbackState = 'playing';

      setState(prev => ({ ...prev, isSetup: true, error: null }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Failed to setup Media Session' 
      }));
    }
  }, [song, preparedUrls, state.isSetup, state.isSupported, onStartDiscovery, appState, earbudPreferences]);

  // Clear Media Session
  const clearMediaSession = useCallback(() => {
    if (!state.isSupported || !state.isSetup) return;

    try {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      
      // Clear all action handlers
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('stop', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);

      setState(prev => ({ ...prev, isSetup: false }));
    } catch {
      // Ignore cleanup errors
    }
  }, [state.isSupported, state.isSetup]);

  // Update playback state
  const updatePlaybackState = useCallback((playbackState: 'playing' | 'paused' | 'none') => {
    if (!state.isSupported || !state.isSetup) return;

    try {
      navigator.mediaSession.playbackState = playbackState;
    } catch {
      // Ignore state update errors
    }
  }, [state.isSupported, state.isSetup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMediaSession();
    };
  }, [clearMediaSession]);

  // Auto-clear when song changes to null
  useEffect(() => {
    if (!song && state.isSetup) {
      clearMediaSession();
    }
  }, [song, state.isSetup, clearMediaSession]);

  return {
    setupMediaSession,
    clearMediaSession,
    updatePlaybackState,
    isSupported: state.isSupported,
    isSetup: state.isSetup
  };
};

/**
 * Simplified Media Session hook for basic use cases
 * Automatically sets up when song is provided
 */
export const useAutoMediaSession = (
  song: Song | null,
  preparedUrls: PreparedUrls | null = null,
  onStartDiscovery?: () => void,
  appState?: AppState,
  earbudPreferences?: EarbudPreferences
): UseMediaSessionResult => {
  const result = useMediaSession(song, preparedUrls, onStartDiscovery, appState, earbudPreferences);

  // Auto-setup when song and preparedUrls are available
  useEffect(() => {
    if (song && preparedUrls && !result.isSetup) {
      result.setupMediaSession();
    }
  }, [song, preparedUrls, result]);

  return result;
};

/**
 * Check if Media Session API is supported
 */
export const isMediaSessionSupported = (): boolean => {
  return 'mediaSession' in navigator;
};

/**
 * Get current Media Session state
 */
export const getMediaSessionState = (): {
  hasMetadata: boolean;
  playbackState: MediaSessionPlaybackState;
} => {
  if (!isMediaSessionSupported()) {
    return { hasMetadata: false, playbackState: 'none' };
  }

  return {
    hasMetadata: navigator.mediaSession.metadata !== null,
    playbackState: navigator.mediaSession.playbackState
  };
};