import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { Play, Share2, Clock } from 'lucide-react';

// Global flag to prevent multiple auto-opens
let hasGlobalAutoOpened = false;

interface SongResultProps {
  song: Song;
  onShare: () => void;
  onTryAgain: () => void;
}

export const SongResult: React.FC<SongResultProps> = ({ 
  song, 
  onShare, 
  onTryAgain 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Auto-open YouTube when result appears (only once globally)
  useEffect(() => {
    if (song.youtubeAutoOpenUrl && !hasGlobalAutoOpened) {
      // console.log('🎵 Auto-opening YouTube for song:', song.title); // Debug log
      window.open(song.youtubeAutoOpenUrl, '_blank');
      hasGlobalAutoOpened = true;
      
      // Reset the global flag after a short delay to allow for new searches
      setTimeout(() => {
        hasGlobalAutoOpened = false;
      }, 2000);
    }
  }, [song.youtubeAutoOpenUrl, song.title]);

  // const formatTime = (seconds: number) => {
  //   const mins = Math.floor(seconds / 60);
  //   const secs = seconds % 60;
  //   return `${mins}:${secs.toString().padStart(2, '0')}`;
  // };

  // const formatConfidence = (confidence: number) => {
  //   return Math.round(confidence * 100);
  // };

  return (
    <div className="animate-slide-up w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto px-2 sm:px-0">
      {/* Main Result Card */}
      <div 
        className="relative p-4 sm:p-6 rounded-2xl backdrop-blur-sm border border-primary-highlight/30 mb-6 overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(22, 33, 62, 0.9)),
            radial-gradient(circle at 20% 80%, rgba(0, 212, 170, 0.1), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(1, 163, 255, 0.05), transparent 50%)
          `,
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 0 1px rgba(75, 94, 138, 0.2)
          `
        }}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-start/5 to-accent-end/5 animate-pulse-slow" />
        
        <div className="relative z-10">
          {/* Album Artwork */}
          <div className="relative mb-4 mx-auto w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-lg">
            {!imageError ? (
              <img
                src={song.artwork}
                alt={`${song.title} artwork`}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-highlight to-primary-end flex items-center justify-center">
                <Play size={48} className="text-text-secondary" />
              </div>
            )}
            
            {/* Loading placeholder */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary-highlight/50 to-primary-end/50 animate-pulse" />
            )}
          </div>

          {/* Song Info */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-text-primary mb-1 leading-tight">
              {song.title}
            </h2>
            <p className="text-lg text-text-secondary mb-2">
              by {song.artist}
            </p>
            <p className="text-sm text-text-secondary/80 mb-1">
              {song.album}
            </p>
            {song.genres && song.genres.length > 0 && (
              <div className="flex justify-center gap-1 mt-2">
                {song.genres.slice(0, 2).map((genre, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-accent-start/20 text-accent-start rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Timestamp only if available */}
          {song.offsetFormatted && (
            <div className="flex justify-center items-center mb-6 text-sm">
              <div className="flex items-center gap-1">
                <Clock size={16} className="text-text-secondary" />
                <span className="text-text-secondary">
                  at {song.offsetFormatted}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Play Button */}
            {song.youtubeMusicUrl && (
              <button
                className="w-full bg-gradient-to-r from-accent-start to-accent-end text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 transition-all duration-200"
                onClick={() => window.open(song.youtubeMusicUrl, '_blank')}
              >
                <Play size={18} />
                <span className="text-sm sm:text-base">Play on YouTube Music</span>
              </button>
            )}
            
            {/* Platform Buttons - Single Row Layout */}
            {(song.spotifyUrl || song.appleMusicUrl) ? (
              <div className="flex gap-2 sm:gap-3">
                {song.spotifyUrl && (
                  <button
                    onClick={() => window.open(song.spotifyUrl, '_blank')}
                    className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium py-3 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1 sm:gap-2 hover:scale-105 transition-all duration-200"
                    title="Open in Spotify"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 17.568c-.227.378-.716.496-1.094.27-2.995-1.83-6.764-2.244-11.207-1.23-.45.105-.901-.225-1.006-.675-.105-.45.225-.901.675-1.006 4.875-1.112 9.066-.643 12.367 1.422.378.226.496.716.27 1.094l-.005.125zm1.568-3.482c-.285.473-.896.621-1.369.336-3.425-2.108-8.64-2.717-12.69-1.486-.533.162-1.097-.136-1.26-.669-.162-.533.136-1.097.669-1.26 4.653-1.413 10.451-.726 14.285 1.709.473.285.621.896.336 1.369l.029.001zm.137-3.629c-4.108-2.44-10.884-2.666-14.804-1.474-.64.195-1.316-.133-1.511-.773-.195-.64.133-1.316.773-1.511 4.492-1.367 12.04-1.104 16.731 1.704.573.342.761 1.08.418 1.653-.342.573-1.08.761-1.653.418l.046.003z"/>
                    </svg>
                    <span className="text-xs sm:text-sm">Spotify</span>
                  </button>
                )}
                
                {song.appleMusicUrl && (
                  <button
                    onClick={() => window.open(song.appleMusicUrl, '_blank')}
                    className="flex-1 bg-gradient-to-r from-[#FA243C] to-[#FF6B6B] text-white font-medium py-3 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1 sm:gap-2 hover:scale-105 transition-all duration-200"
                    title="Open in Apple Music"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                    </svg>
                    <span className="text-xs sm:text-sm">Apple</span>
                  </button>
                )}
                
                <button
                  onClick={onShare}
                  className="flex-1 bg-primary-highlight/80 backdrop-blur-sm text-text-primary font-medium py-3 px-2 sm:px-3 rounded-xl flex items-center justify-center gap-1 sm:gap-2 hover:bg-primary-highlight hover:scale-105 transition-all duration-200 border border-primary-highlight/30"
                >
                  <Share2 size={16} />
                  <span className="text-xs sm:text-sm">Share</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onShare}
                className="w-full bg-primary-highlight/80 backdrop-blur-sm text-text-primary font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-highlight hover:scale-105 transition-all duration-200 border border-primary-highlight/30"
              >
                <Share2 size={18} />
                <span className="text-sm sm:text-base">Share</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Try Again Button */}
      <button
        onClick={onTryAgain}
        className="w-full bg-primary-dark/80 backdrop-blur-sm text-text-secondary font-medium py-3 px-4 rounded-xl border border-primary-highlight/20 hover:bg-primary-highlight/30 hover:text-text-primary hover:border-primary-highlight/40 transition-all duration-200"
      >
        <span className="text-sm sm:text-base">Discover Another Track</span>
      </button>
    </div>
  );
};