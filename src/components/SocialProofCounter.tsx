import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Share2, Music, Eye, Heart } from 'lucide-react';
import { Song } from '../types';

interface SocialProofCounterProps {
  song?: Song;
  variant?: 'compact' | 'full' | 'minimal';
  showTrending?: boolean;
}

interface SocialStats {
  shares: number;
  views: number;
  discoveries: number;
  trending: boolean;
}

export const SocialProofCounter: React.FC<SocialProofCounterProps> = ({ 
  song, 
  variant = 'compact',
  showTrending = true 
}) => {
  const [stats, setStats] = useState<SocialStats>({
    shares: 0,
    views: 0,
    discoveries: 0,
    trending: false
  });

  const [globalStats, setGlobalStats] = useState({
    totalDiscoveries: 1247,
    totalShares: 892,
    activeUsers: 156
  });

  useEffect(() => {
    // Generate realistic-looking stats for the song
    if (song) {
      const baseShares = Math.floor(Math.random() * 50) + 10;
      const baseViews = baseShares * (Math.floor(Math.random() * 8) + 3);
      const baseDiscoveries = Math.floor(baseViews * 0.3);
      
      setStats({
        shares: baseShares,
        views: baseViews,
        discoveries: baseDiscoveries,
        trending: Math.random() > 0.7 // 30% chance of being trending
      });
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      setGlobalStats(prev => ({
        totalDiscoveries: prev.totalDiscoveries + Math.floor(Math.random() * 3),
        totalShares: prev.totalShares + Math.floor(Math.random() * 2),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5) - 2
      }));

      if (song && Math.random() > 0.8) { // 20% chance of stats update
        setStats(prev => ({
          ...prev,
          shares: prev.shares + (Math.random() > 0.5 ? 1 : 0),
          views: prev.views + Math.floor(Math.random() * 3),
          discoveries: prev.discoveries + (Math.random() > 0.7 ? 1 : 0)
        }));
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [song]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <Users size={12} />
        <span>{formatNumber(globalStats.activeUsers)} discovering now</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 text-sm">
        {song && stats.trending && showTrending && (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
            <TrendingUp size={12} />
            <span>Trending</span>
          </div>
        )}
        
        <div className="flex items-center gap-1 text-text-secondary">
          <Eye size={12} />
          <span>{formatNumber(song ? stats.views : globalStats.totalDiscoveries)}</span>
        </div>
        
        <div className="flex items-center gap-1 text-text-secondary">
          <Share2 size={12} />
          <span>{formatNumber(song ? stats.shares : globalStats.totalShares)}</span>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="space-y-3">
      {/* Song-specific stats */}
      {song && (
        <div className="bg-primary-highlight/10 rounded-xl p-4 backdrop-blur-sm border border-primary-highlight/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-text-primary">This Track</h4>
            {stats.trending && showTrending && (
              <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                <TrendingUp size={12} />
                <span>Trending</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Eye size={14} className="text-accent-start" />
                <span className="text-lg font-semibold text-text-primary">{formatNumber(stats.views)}</span>
              </div>
              <p className="text-xs text-text-secondary">Views</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Share2 size={14} className="text-accent-start" />
                <span className="text-lg font-semibold text-text-primary">{formatNumber(stats.shares)}</span>
              </div>
              <p className="text-xs text-text-secondary">Shares</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart size={14} className="text-accent-start" />
                <span className="text-lg font-semibold text-text-primary">{formatNumber(stats.discoveries)}</span>
              </div>
              <p className="text-xs text-text-secondary">Found</p>
            </div>
          </div>
        </div>
      )}

      {/* Global stats */}
      <div className="bg-primary-highlight/5 rounded-xl p-4 backdrop-blur-sm border border-primary-highlight/10">
        <h4 className="font-medium text-text-primary mb-3">Syncify Community</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-secondary">
              <Music size={14} />
              <span className="text-sm">Songs Discovered Today</span>
            </div>
            <span className="font-semibold text-accent-start">{formatNumber(globalStats.totalDiscoveries)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-secondary">
              <Share2 size={14} />
              <span className="text-sm">Shares Today</span>
            </div>
            <span className="font-semibold text-accent-start">{formatNumber(globalStats.totalShares)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-secondary">
              <Users size={14} />
              <span className="text-sm">Active Now</span>
            </div>
            <span className="font-semibold text-accent-start flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {formatNumber(globalStats.activeUsers)}
            </span>
          </div>
        </div>
      </div>

      {/* Viral call-to-action */}
      <div className="text-center text-xs text-text-secondary">
        <p>🔥 Join {formatNumber(globalStats.activeUsers)} music lovers discovering songs right now!</p>
      </div>
    </div>
  );
};