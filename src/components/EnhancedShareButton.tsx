import React, { useState, useEffect } from 'react';
import { Share2, Instagram, MessageCircle, Twitter, Download, Copy, Camera, Zap, Trophy, Heart } from 'lucide-react';
import { Song } from '../types';
import { StoryCardGenerator } from './StoryCardGenerator';
import { StorySharing } from '../services/storySharing';

interface EnhancedShareButtonProps {
  song: Song;
  onToast?: (message: string, type: 'success' | 'error') => void;
  compact?: boolean;
}

export const EnhancedShareButton: React.FC<EnhancedShareButtonProps> = ({ 
  song, 
  onToast,
  compact = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [storyCardUrl, setStoryCardUrl] = useState<string>('');
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [cardVariant, setCardVariant] = useState<'story' | 'square' | 'wide'>('story');

  const handleCardGenerated = (imageUrl: string) => {
    setStoryCardUrl(imageUrl);
    setIsGeneratingCard(false);
  };

  const handleShare = async (platform: string, shareType: 'discovery' | 'challenge' | 'flex' | 'recommendation' = 'discovery') => {
    try {
      let result;
      
      switch (platform) {
        case 'instagram':
          if (!storyCardUrl) {
            setIsGeneratingCard(true);
            return;
          }
          result = await StorySharing.shareToInstagramStories(storyCardUrl, song);
          break;
          
        case 'whatsapp':
          result = await StorySharing.shareToWhatsAppStatus(storyCardUrl, song);
          break;
          
        case 'twitter':
          result = await StorySharing.shareToTwitter(song, storyCardUrl);
          break;
          
        case 'download':
          if (!storyCardUrl) {
            setIsGeneratingCard(true);
            return;
          }
          result = await StorySharing.downloadImage(storyCardUrl, `${song.title}-story.png`);
          break;
          
        case 'copy':
          if (storyCardUrl) {
            result = await StorySharing.copyImageToClipboard(storyCardUrl);
          } else {
            // Copy text instead
            const shareText = StorySharing.generateShareText(song, { shareType });
            await navigator.clipboard.writeText(shareText);
            result = { success: true, platform: 'clipboard-text' };
          }
          break;
          
        case 'native':
          result = await StorySharing.shareNative(song, storyCardUrl);
          break;
          
        default:
          result = { success: false, error: 'Unknown platform' };
      }
      
      if (result.success) {
        onToast?.(getSuccessMessage(platform), 'success');
        StorySharing.trackShare(song, platform, shareType);
      } else {
        onToast?.(result.error || 'Failed to share', 'error');
      }
    } catch {
      onToast?.('Failed to share', 'error');
    }
    
    setIsOpen(false);
  };

  const getSuccessMessage = (platform: string): string => {
    switch (platform) {
      case 'instagram':
        return 'Opening Instagram Stories...';
      case 'whatsapp':
        return 'Opening WhatsApp...';
      case 'twitter':
        return 'Opening Twitter...';
      case 'download':
        return 'Story card downloaded!';
      case 'copy':
        return 'Copied to clipboard!';
      case 'native':
        return 'Opening share menu...';
      default:
        return 'Shared successfully!';
    }
  };

  const shareOptions = [
    {
      id: 'instagram',
      name: 'Instagram Stories',
      icon: Instagram,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      description: 'Share as story card'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Status',
      icon: MessageCircle,
      color: 'bg-green-500',
      description: 'Share to status'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: Twitter,
      color: 'bg-blue-500',
      description: 'Tweet with style'
    },
    {
      id: 'download',
      name: 'Download Card',
      icon: Download,
      color: 'bg-gray-600',
      description: 'Save story card'
    },
    {
      id: 'copy',
      name: 'Copy',
      icon: Copy,
      color: 'bg-indigo-500',
      description: 'Copy to clipboard'
    },
    {
      id: 'native',
      name: 'More Options',
      icon: Share2,
      color: 'bg-accent-start',
      description: 'System share menu'
    }
  ];

  const shareTypeOptions = [
    { id: 'discovery', name: 'Discovery', icon: Zap, description: 'I found this song!' },
    { id: 'challenge', name: 'Challenge', icon: Trophy, description: 'Can you guess this?' },
    { id: 'flex', name: 'Flex', icon: Camera, description: 'Show off your taste' },
    { id: 'recommendation', name: 'Recommend', icon: Heart, description: 'You need to hear this' }
  ];

  // Generate card when component mounts
  useEffect(() => {
    if (!storyCardUrl) {
      setIsGeneratingCard(true);
    }
  }, []);

  // Generate card when variant changes
  useEffect(() => {
    if (isGeneratingCard && !storyCardUrl) {
      setIsGeneratingCard(true);
    }
  }, [cardVariant]);

  if (compact) {
    return (
      <button
        onClick={() => handleShare('native', 'discovery')}
        className="flex items-center gap-2 px-3 py-2 bg-accent-start/20 hover:bg-accent-start/30 text-accent-start rounded-lg transition-all duration-200"
      >
        <Share2 size={16} />
        <span className="text-sm">Share</span>
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Hidden canvas for card generation */}
      {isGeneratingCard && (
        <StoryCardGenerator
          song={song}
          onCardGenerated={handleCardGenerated}
          variant={cardVariant}
          style="vibrant"
        />
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-accent-start/20 hover:bg-accent-start/30 text-accent-start rounded-xl transition-all duration-200 hover:scale-105"
      >
        <Share2 size={18} />
        <span>Share</span>
      </button>

      {/* Enhanced Share Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-primary-dark/95 backdrop-blur-sm border border-primary-highlight/30 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-primary-highlight/20">
            <h3 className="text-lg font-semibold text-text-primary mb-1">Share Your Discovery</h3>
            <p className="text-sm text-text-secondary">Choose your viral moment</p>
          </div>

          {/* Share Type Selection */}
          <div className="p-4 border-b border-primary-highlight/20">
            <h4 className="text-sm font-medium text-text-primary mb-2">Share Style</h4>
            <div className="grid grid-cols-2 gap-2">
              {shareTypeOptions.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleShare('native', type.id as 'discovery' | 'challenge' | 'flex' | 'recommendation')}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-highlight/20 transition-all duration-200 text-left"
                >
                  <type.icon size={16} className="text-accent-start" />
                  <div>
                    <div className="text-sm font-medium text-text-primary">{type.name}</div>
                    <div className="text-xs text-text-secondary">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card Format Selection */}
          <div className="p-4 border-b border-primary-highlight/20">
            <h4 className="text-sm font-medium text-text-primary mb-2">Card Format</h4>
            <div className="flex gap-2">
              {[
                { id: 'story', name: 'Story', desc: '9:16' },
                { id: 'square', name: 'Square', desc: '1:1' },
                { id: 'wide', name: 'Wide', desc: '16:9' }
              ].map((format) => (
                <button
                  key={format.id}
                  onClick={() => {
                    setCardVariant(format.id as 'story' | 'square' | 'wide');
                    setStoryCardUrl('');
                    setIsGeneratingCard(true);
                  }}
                  className={`flex-1 p-2 rounded-lg text-center transition-all duration-200 ${
                    cardVariant === format.id
                      ? 'bg-accent-start/20 border border-accent-start/30'
                      : 'bg-primary-highlight/10 hover:bg-primary-highlight/20'
                  }`}
                >
                  <div className="text-sm font-medium text-text-primary">{format.name}</div>
                  <div className="text-xs text-text-secondary">{format.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Share Options */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleShare(option.id)}
                  disabled={isGeneratingCard && ['instagram', 'download'].includes(option.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                    option.color
                  } ${
                    isGeneratingCard && ['instagram', 'download'].includes(option.id)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:shadow-lg'
                  }`}
                >
                  <option.icon size={20} className="text-white" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">{option.name}</div>
                    <div className="text-xs text-white/80">{option.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isGeneratingCard && (
            <div className="absolute inset-0 bg-primary-dark/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-start mx-auto mb-2"></div>
                <p className="text-sm text-text-secondary">Generating story card...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};