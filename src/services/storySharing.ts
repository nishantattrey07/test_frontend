import { Song } from '../types';

export interface ShareOptions {
  includeChallenge?: boolean;
  shareType?: 'discovery' | 'challenge' | 'flex' | 'recommendation';
  platform?: 'instagram' | 'whatsapp' | 'twitter' | 'general';
}

export interface ShareResult {
  success: boolean;
  platform?: string;
  error?: string;
}

export class StorySharing {
  // Generate viral share text with different hooks
  static generateShareText(song: Song, options: ShareOptions = {}): string {
    const { includeChallenge = false, shareType = 'discovery' } = options;
    
    const hooks = {
      discovery: [
        `🔥 Just discovered "${song.title}" by ${song.artist} in 5 seconds!`,
        `🎵 Found this absolute banger: "${song.title}" by ${song.artist}`,
        `✨ Syncify just blew my mind - "${song.title}" by ${song.artist}`,
        `🎧 This song identification is next level: "${song.title}" by ${song.artist}`
      ],
      challenge: [
        `🎯 Can you guess this song in 5 seconds? "${song.title}" by ${song.artist}`,
        `🔍 I identified this instantly - can you? "${song.title}" by ${song.artist}`,
        `⚡ Challenge: Name this song faster than Syncify! "${song.title}" by ${song.artist}`,
        `🎮 Music quiz time! This is "${song.title}" by ${song.artist}`
      ],
      flex: [
        `😎 While you're still humming, I already know it's "${song.title}" by ${song.artist}`,
        `🏆 Song identification speedrun: "${song.title}" by ${song.artist} - 5 seconds!`,
        `🔥 That feeling when you ID a song instantly: "${song.title}" by ${song.artist}`,
        `⚡ Superhuman music recognition: "${song.title}" by ${song.artist}`
      ],
      recommendation: [
        `🎶 You need to hear this: "${song.title}" by ${song.artist}`,
        `💎 Hidden gem alert: "${song.title}" by ${song.artist}`,
        `🎯 Your next favorite song: "${song.title}" by ${song.artist}`,
        `🔥 Adding this to your playlist: "${song.title}" by ${song.artist}`
      ]
    };

    const randomHook = hooks[shareType][Math.floor(Math.random() * hooks[shareType].length)];
    
    let shareText = randomHook;
    
    // Add timestamp if available
    if (song.offsetFormatted) {
      shareText += ` at ${song.offsetFormatted}`;
    }
    
    // Add challenge element
    if (includeChallenge) {
      shareText += '\n\nCan you identify songs this fast? 🤔';
    }
    
    // Add app promotion
    shareText += '\n\nTry Syncify - identify any song in seconds! 🎵';
    shareText += `\n${song.shareableUrl}`;
    
    // Add viral hashtags
    const hashtags = [
      '#SyncYourSound',
      '#MusicDiscovery',
      '#SongIdentification',
      '#MusicLover',
      '#Syncify'
    ];
    
    if (includeChallenge) {
      hashtags.push('#MusicChallenge', '#GuessTheSong');
    }
    
    shareText += `\n\n${hashtags.join(' ')}`;
    
    return shareText;
  }

  // Share to Instagram Stories
  static async shareToInstagramStories(imageUrl: string): Promise<ShareResult> {
    try {
      // Check if Instagram app is available (mobile detection)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Try Instagram Stories URL scheme
        const instagramUrl = `instagram://story-camera`;
        
        // Create a temporary link and try to open Instagram
        const link = document.createElement('a');
        link.href = instagramUrl;
        link.click();
        
        // Also copy the image URL to clipboard for manual sharing
        try {
          await navigator.clipboard.writeText(imageUrl);
        } catch {
          console.warn('Could not copy image URL to clipboard');
        }
        
        return {
          success: true,
          platform: 'instagram'
        };
      } else {
        // On desktop, provide instructions
        return {
          success: false,
          error: 'Instagram Stories sharing is only available on mobile devices'
        };
      }
    } catch {
      return {
        success: false,
        error: 'Failed to share to Instagram Stories'
      };
    }
  }

  // Share to WhatsApp Status
  static async shareToWhatsAppStatus(imageUrl: string, song: Song): Promise<ShareResult> {
    try {
      const shareText = this.generateShareText(song, { shareType: 'discovery' });
      const encodedText = encodeURIComponent(shareText);
      
      // Check if mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // WhatsApp URL scheme
        const whatsappUrl = `whatsapp://send?text=${encodedText}`;
        window.open(whatsappUrl, '_blank');
        
        return {
          success: true,
          platform: 'whatsapp'
        };
      } else {
        // Desktop WhatsApp Web
        const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodedText}`;
        window.open(whatsappWebUrl, '_blank');
        
        return {
          success: true,
          platform: 'whatsapp-web'
        };
      }
    } catch {
      return {
        success: false,
        error: 'Failed to share to WhatsApp'
      };
    }
  }

  // Share to Twitter/X
  static async shareToTwitter(song: Song, imageUrl?: string): Promise<ShareResult> {
    try {
      const shareText = this.generateShareText(song, { shareType: 'flex' });
      const encodedText = encodeURIComponent(shareText);
      
      let twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
      
      if (imageUrl) {
        // Note: Twitter doesn't support direct image URLs in the intent
        // Users would need to attach the image manually
        twitterUrl += `&url=${encodeURIComponent(song.shareableUrl || '')}`;
      }
      
      window.open(twitterUrl, '_blank');
      
      return {
        success: true,
        platform: 'twitter'
      };
    } catch {
      return {
        success: false,
        error: 'Failed to share to Twitter'
      };
    }
  }

  // Download image for manual sharing
  static async downloadImage(imageUrl: string, filename: string): Promise<ShareResult> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        platform: 'download'
      };
    } catch {
      return {
        success: false,
        error: 'Failed to download image'
      };
    }
  }

  // Copy image to clipboard (for modern browsers)
  static async copyImageToClipboard(imageUrl: string): Promise<ShareResult> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      return {
        success: true,
        platform: 'clipboard'
      };
    } catch {
      // Fallback: copy the URL instead
      try {
        await navigator.clipboard.writeText(imageUrl);
        return {
          success: true,
          platform: 'clipboard-url'
        };
      } catch {
        return {
          success: false,
          error: 'Failed to copy image to clipboard'
        };
      }
    }
  }

  // Enhanced native share with image support
  static async shareNative(song: Song, imageUrl?: string): Promise<ShareResult> {
    try {
      if (!navigator.share) {
        throw new Error('Native sharing not supported');
      }

      const shareText = this.generateShareText(song, { shareType: 'discovery' });
      
      const shareData: ShareData = {
        title: `${song.title} by ${song.artist}`,
        text: shareText,
        url: song.shareableUrl || window.location.href
      };

      // Try to include image if supported
      if (imageUrl && 'canShare' in navigator) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], `${song.title}-story.png`, { type: 'image/png' });
          
          const shareDataWithImage = {
            ...shareData,
            files: [file]
          };
          
          if (navigator.canShare && navigator.canShare(shareDataWithImage)) {
            await navigator.share(shareDataWithImage);
            return {
              success: true,
              platform: 'native-with-image'
            };
          }
        } catch {
          console.warn('Could not share with image, falling back to text');
        }
      }

      // Fallback to text-only sharing
      await navigator.share(shareData);
      
      return {
        success: true,
        platform: 'native'
      };
    } catch {
      return {
        success: false,
        error: 'Failed to share natively'
      };
    }
  }

  // Create challenge share
  static generateChallengeShare(song: Song): string {
    const challengeTexts = [
      `🎯 MUSIC CHALLENGE: Can you identify this song in 5 seconds?`,
      `🔍 Quick quiz: What song is this?`,
      `⚡ Speed test: Name this track!`,
      `🎮 Music game: Guess the song!`
    ];
    
    const randomChallenge = challengeTexts[Math.floor(Math.random() * challengeTexts.length)];
    
    let challengeText = randomChallenge;
    challengeText += '\n\n(Scroll for answer)';
    challengeText += '\n\n.\n.\n.\n.\n.\n.\n.\n.\n.\n.\n';
    challengeText += `\n🎵 ANSWER: "${song.title}" by ${song.artist}`;
    
    if (song.offsetFormatted) {
      challengeText += ` at ${song.offsetFormatted}`;
    }
    
    challengeText += '\n\nHow fast did you get it? 🤔';
    challengeText += '\n\nTry Syncify for instant song ID! 🎵';
    challengeText += `\n${song.shareableUrl}`;
    challengeText += '\n\n#MusicChallenge #GuessTheSong #SyncYourSound';
    
    return challengeText;
  }

  // Track sharing analytics (for future implementation)
  static trackShare(song: Song, platform: string, shareType: string): void {
    // Store sharing data in localStorage for analytics
    const shareData = {
      songId: song.id,
      songTitle: song.title,
      artist: song.artist,
      platform,
      shareType,
      timestamp: new Date().toISOString()
    };
    
    try {
      const existingShares = JSON.parse(localStorage.getItem('syncify_shares') || '[]');
      existingShares.push(shareData);
      
      // Keep only last 100 shares
      if (existingShares.length > 100) {
        existingShares.splice(0, existingShares.length - 100);
      }
      
      localStorage.setItem('syncify_shares', JSON.stringify(existingShares));
    } catch {
      console.warn('Could not track share');
    }
  }
}

export default StorySharing;