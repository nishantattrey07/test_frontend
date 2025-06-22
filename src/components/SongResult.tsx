import React, { useState } from 'react';
import { Song } from '../types';
import { Play, Share2, ExternalLink, Clock, Award } from 'lucide-react';

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatConfidence = (confidence: number) => {
    return Math.round(confidence * 100);
  };

  return (
    <div className="animate-slide-up w-full max-w-sm mx-auto">
      {/* Main Result Card */}
      <div 
        className="relative p-6 rounded-2xl backdrop-blur-sm border border-primary-highlight/30 mb-6 overflow-hidden"
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
          <div className="relative mb-4 mx-auto w-48 h-48 rounded-xl overflow-hidden shadow-lg">
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
              "{song.title}"
            </h2>
            <p className="text-lg text-text-secondary mb-2">
              by {song.artist}
            </p>
            <p className="text-sm text-text-secondary/80">
              {song.album}
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-1">
              <Award size={16} className="text-success" />
              <span className="text-text-primary font-medium">
                {formatConfidence(song.confidence)}% Match
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-text-secondary" />
              <span className="text-text-secondary">
                0:{song.offset.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              className="flex-1 bg-gradient-to-r from-accent-start to-accent-end text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 transition-all duration-200"
              onClick={() => window.open(song.spotifyUrl, '_blank')}
            >
              <Play size={18} />
              <span>Play</span>
            </button>
            
            <button
              onClick={onShare}
              className="flex-1 bg-primary-highlight/80 backdrop-blur-sm text-text-primary font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-highlight hover:scale-105 transition-all duration-200 border border-primary-highlight/30"
            >
              <Share2 size={18} />
              <span>Share</span>
            </button>

            <button
              onClick={() => window.open(song.spotifyUrl, '_blank')}
              className="bg-primary-highlight/60 backdrop-blur-sm text-text-secondary p-3 rounded-xl hover:bg-primary-highlight/80 hover:text-text-primary hover:scale-105 transition-all duration-200 border border-primary-highlight/20"
            >
              <ExternalLink size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Try Again Button */}
      <button
        onClick={onTryAgain}
        className="w-full bg-primary-dark/80 backdrop-blur-sm text-text-secondary font-medium py-3 px-4 rounded-xl border border-primary-highlight/20 hover:bg-primary-highlight/30 hover:text-text-primary hover:border-primary-highlight/40 transition-all duration-200"
      >
        Try Again
      </button>
    </div>
  );
};