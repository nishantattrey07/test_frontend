import React from 'react';
import { X, Clock, ExternalLink, Trash2, Music } from 'lucide-react';
import { storageService } from '../services/storageService';
import type { MusicMatch } from '../types';

interface HistoryPanelProps {
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose }) => {
  const history = storageService.getHistory();

  const handleOpenMusic = (match: MusicMatch) => {
    // Use YouTube Music URL for direct playback, fallback to regular YouTube URL
    const musicUrl = match.youtubeMusicUrl || match.youtubeUrl;
    window.open(musicUrl, '_blank');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center md:items-center animate-fade-in">
      <div className="glass backdrop-premium rounded-t-4xl md:rounded-4xl w-full max-w-md max-h-[85vh] md:max-h-[75vh] overflow-hidden shadow-float-lg animate-slide-up">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent-gradient rounded-2xl flex items-center justify-center shadow-glow">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Recent Discoveries</h2>
              <p className="text-xs text-text-secondary">Your musical journey</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="glass-card p-2 hover:bg-white/20 transition-all duration-200 group"
          >
            <X className="w-5 h-5 text-text-secondary group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Enhanced History List */}
        <div className="overflow-y-auto max-h-96 custom-scrollbar">
          {history.length > 0 ? (
            <div className="p-4 space-y-3">
              {history.map((match, index) => (
                <div
                  key={`${match.id}-${index}`}
                  onClick={() => handleOpenMusic(match)}
                  className="glass-card p-4 hover:bg-white/10 active:bg-white/20 transition-all duration-200 group animate-scale-in cursor-pointer touch-feedback"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    {/* Enhanced Album Art */}
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-accent-gradient flex-shrink-0 shadow-lg">
                      {match.albumArt ? (
                        <img
                          src={match.albumArt}
                          alt="Album art"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xl">
                          <Music className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    {/* Enhanced Song Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate group-hover:text-accent-start transition-colors">
                        {match.title}
                      </h3>
                      <p className="text-text-secondary text-sm truncate">
                        {match.artist}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                        <p className="text-text-muted text-xs">
                          {formatDate(match.timestamp)}
                        </p>
                        <div className="w-1 h-1 bg-text-muted rounded-full"></div>
                        <p className="text-text-muted text-xs">
                          {Math.round(match.confidence)}% match
                        </p>
                      </div>
                    </div>

                    {/* Visual Indicator for Clickable Card */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-2 h-2 bg-accent-start rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center animate-fade-in">
              <div className="relative mb-6">
                <div className="text-6xl animate-float">🎵</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-accent-start/20 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-2">No discoveries yet</h3>
              <p className="text-text-secondary text-sm max-w-xs mx-auto">
                Start identifying music to see your recent finds here. Your musical journey awaits!
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-white/10 text-center">
            <button
              onClick={() => {
                storageService.clearHistory();
                onClose();
              }}
              className="flex items-center justify-center space-x-2 text-error hover:text-red-300 text-sm font-semibold transition-colors duration-200 mx-auto glass-card px-4 py-2 rounded-xl hover:bg-error/10"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;