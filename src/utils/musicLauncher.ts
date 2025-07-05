// High-performance YouTube Music launcher with 100ms max delay
// Pre-builds URLs during song processing for zero-delay launching

import { Song } from '../types';
import { getPlatform } from './platformDetection';

export interface PreparedUrls {
  iosUrl: string;
  androidUrl: string;
  webUrl: string;
  videoId: string;
}

export interface LaunchOptions {
  videoId?: string;
  playlistId?: string;
  timestamp?: number;
  webUrl?: string;
}

// Compiled regex for maximum speed
const VIDEO_ID_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;

/**
 * Extract video ID from YouTube URL with high performance
 * Uses compiled regex for maximum speed
 */
const extractVideoId = (url: string): string => {
  if (!url) return '';
  const match = url.match(VIDEO_ID_REGEX);
  return match?.[1] || '';
};

/**
 * Pre-build all launch URLs during song processing
 * Call this immediately when song is identified for zero-delay launching
 */
export const prepareLaunchUrls = (song: Song): PreparedUrls => {
  const videoId = extractVideoId(song.youtubeUrl || song.youtubePlaybackUrl || '');
  const timestamp = song.offset || 0;
  const timestampParam = timestamp > 0 ? `&t=${Math.floor(timestamp)}s` : '';
  
  // Pre-build all possible URLs with correct YouTube Music schemes
  // iOS: Use youtubemusic:// scheme to open YouTube Music app directly
  const iosUrl = `youtubemusic://watch?v=${videoId}${timestampParam}`;
  
  // Web: Always use music.youtube.com domain for YouTube Music
  const youtubeMusicWebUrl = `https://music.youtube.com/watch?v=${videoId}${timestampParam}`;
  
  // Android: Use Intent with correct package name for YouTube Music app
  const androidUrl = `intent://music.youtube.com/watch?v=${videoId}${timestampParam}#Intent;scheme=https;package=com.google.android.apps.youtube.music;S.browser_fallback_url=${encodeURIComponent(youtubeMusicWebUrl)};end`;
  
  const webUrl = youtubeMusicWebUrl;
  
  return {
    iosUrl,
    androidUrl,
    webUrl,
    videoId
  };
};

/**
 * Launch YouTube Music with cached platform detection and pre-built URLs
 * Uses hidden iframe method for fastest app launching (100ms max delay)
 */
export const launchYouTubeMusic = (preparedUrls: PreparedUrls): void => {
  const platform = getPlatform(); // Cached, no detection overhead
  
  if (platform.isMobile && platform.hasYouTubeMusicApp) {
    // Use hidden iframe method - faster than window.location.href
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'display:none;position:absolute;width:1px;height:1px;top:-1000px;';
    
    // Select appropriate URL scheme based on platform
    const appUrl = platform.isIOS ? preparedUrls.iosUrl : preparedUrls.androidUrl;
    iframe.src = appUrl;
    
    document.body.appendChild(iframe);
    
    // CRITICAL: Only 100ms delay for maximum performance
    // Most apps launch within 50-100ms, so this is optimal
    setTimeout(() => {
      try {
        // Try to detect if app launched by checking if page is still visible
        // If document is hidden, app likely launched successfully
        if (!document.hidden) {
          window.open(preparedUrls.webUrl, '_blank');
        }
      } catch {
        // Fallback to web if there's any error
        window.open(preparedUrls.webUrl, '_blank');
      }
      
      // Immediate cleanup for memory efficiency
      try {
        document.body.removeChild(iframe);
      } catch {
        // Ignore cleanup errors
      }
    }, 100);
  } else {
    // Desktop or no app detected - direct web launch
    window.open(preparedUrls.webUrl, '_blank');
  }
};

/**
 * Alternative launch method using options (for backward compatibility)
 * Prefer prepareLaunchUrls + launchYouTubeMusic for better performance
 */
export const launchYouTubeMusicWithOptions = (options: LaunchOptions): void => {
  const { videoId, timestamp, webUrl } = options;
  
  if (!videoId && !webUrl) {
    console.warn('No video ID or web URL provided for YouTube Music launch');
    return;
  }
  
  // Build URLs on-demand (slower than pre-built)
  const timestampParam = timestamp && timestamp > 0 ? `&t=${Math.floor(timestamp)}s` : '';
  const finalVideoId = videoId || extractVideoId(webUrl || '');
  const youtubeMusicWebUrl = `https://music.youtube.com/watch?v=${finalVideoId}${timestampParam}`;
  
  const preparedUrls: PreparedUrls = {
    iosUrl: `youtubemusic://watch?v=${finalVideoId}${timestampParam}`,
    androidUrl: `intent://music.youtube.com/watch?v=${finalVideoId}${timestampParam}#Intent;scheme=https;package=com.google.android.apps.youtube.music;S.browser_fallback_url=${encodeURIComponent(youtubeMusicWebUrl)};end`,
    webUrl: youtubeMusicWebUrl,
    videoId: finalVideoId
  };
  
  launchYouTubeMusic(preparedUrls);
};

/**
 * Check if app launch detection is supported
 */
export const supportsAppLaunchDetection = (): boolean => {
  return 'hidden' in document && typeof document.hidden === 'boolean';
};

/**
 * Enhanced launch with callback support for tracking
 */
export const launchYouTubeMusicWithCallback = (
  preparedUrls: PreparedUrls,
  onLaunchAttempt?: () => void,
  onWebFallback?: () => void
): void => {
  onLaunchAttempt?.();
  
  const platform = getPlatform();
  
  if (platform.isMobile && platform.hasYouTubeMusicApp) {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'display:none;position:absolute;width:1px;height:1px;top:-1000px;';
    iframe.src = platform.isIOS ? preparedUrls.iosUrl : preparedUrls.androidUrl;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      try {
        if (!document.hidden) {
          window.open(preparedUrls.webUrl, '_blank');
          onWebFallback?.();
        }
      } catch {
        window.open(preparedUrls.webUrl, '_blank');
        onWebFallback?.();
      }
      
      try {
        document.body.removeChild(iframe);
      } catch {
        // Ignore cleanup errors
      }
    }, 100);
  } else {
    window.open(preparedUrls.webUrl, '_blank');
    onWebFallback?.();
  }
};