import React, { useRef, useEffect, useState } from 'react';
import { Song } from '../types';

interface StoryCardGeneratorProps {
  song: Song;
  onCardGenerated: (imageUrl: string) => void;
  variant?: 'story' | 'square' | 'wide';
  style?: 'minimal' | 'vibrant' | 'gradient';
}

export const StoryCardGenerator: React.FC<StoryCardGeneratorProps> = ({
  song,
  onCardGenerated,
  variant = 'story',
  style = 'vibrant'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCard = async () => {
    if (!canvasRef.current) return;
    
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on variant
    const dimensions = {
      story: { width: 1080, height: 1920 }, // 9:16 Instagram Stories
      square: { width: 1080, height: 1080 }, // 1:1 for general sharing
      wide: { width: 1200, height: 630 } // 1.91:1 for Twitter/Facebook
    };

    const { width, height } = dimensions[variant];
    canvas.width = width;
    canvas.height = height;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (style === 'vibrant') {
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.3, '#1a1a2e');
      gradient.addColorStop(0.6, '#16213e');
      gradient.addColorStop(1, '#0f172a');
    } else if (style === 'gradient') {
      gradient.addColorStop(0, '#00d4aa');
      gradient.addColorStop(1, '#01a3ff');
    } else {
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#0f172a');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add glow effects
    if (style === 'vibrant' || style === 'gradient') {
      // Top glow
      const glowGradient1 = ctx.createRadialGradient(width * 0.2, height * 0.2, 0, width * 0.2, height * 0.2, width * 0.4);
      glowGradient1.addColorStop(0, 'rgba(0, 212, 170, 0.15)');
      glowGradient1.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient1;
      ctx.fillRect(0, 0, width, height);

      // Bottom glow
      const glowGradient2 = ctx.createRadialGradient(width * 0.8, height * 0.8, 0, width * 0.8, height * 0.8, width * 0.5);
      glowGradient2.addColorStop(0, 'rgba(1, 163, 255, 0.1)');
      glowGradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient2;
      ctx.fillRect(0, 0, width, height);
    }

    try {
      // Load and draw album artwork
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const artworkSize = variant === 'story' ? width * 0.6 : width * 0.4;
          const artworkX = (width - artworkSize) / 2;
          const artworkY = variant === 'story' ? height * 0.15 : height * 0.1;

          // Draw artwork with rounded corners
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(artworkX, artworkY, artworkSize, artworkSize, 20);
          ctx.clip();
          ctx.drawImage(img, artworkX, artworkY, artworkSize, artworkSize);
          ctx.restore();

          // Add artwork border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(artworkX, artworkY, artworkSize, artworkSize, 20);
          ctx.stroke();

          resolve();
        };
        img.onerror = reject;
      });

      img.src = song.artwork;
    } catch (error) {
      console.error('Failed to load artwork:', error);
      // Draw placeholder artwork
      const artworkSize = variant === 'story' ? width * 0.6 : width * 0.4;
      const artworkX = (width - artworkSize) / 2;
      const artworkY = variant === 'story' ? height * 0.15 : height * 0.1;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.roundRect(artworkX, artworkY, artworkSize, artworkSize, 20);
      ctx.fill();

      // Music note icon
      ctx.fillStyle = '#ffffff';
      ctx.font = `${artworkSize * 0.3}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('♪', artworkX + artworkSize / 2, artworkY + artworkSize / 2);
    }

    // Text positioning
    const textStartY = variant === 'story' ? height * 0.62 : height * 0.6;
    
    // Song title
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${variant === 'story' ? '64px' : '48px'} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Handle long titles
    const maxWidth = width * 0.85;
    const titleLines = wrapText(ctx, song.title, maxWidth);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, width / 2, textStartY + (index * (variant === 'story' ? 70 : 55)));
    });

    // Artist name
    ctx.fillStyle = '#a0a0a0';
    ctx.font = `${variant === 'story' ? '44px' : '36px'} -apple-system, BlinkMacSystemFont, sans-serif`;
    const artistY = textStartY + (titleLines.length * (variant === 'story' ? 70 : 55)) + 20;
    ctx.fillText(`by ${song.artist}`, width / 2, artistY);

    // Timestamp if available
    if (song.offsetFormatted) {
      ctx.fillStyle = '#00d4aa';
      ctx.font = `${variant === 'story' ? '36px' : '28px'} -apple-system, BlinkMacSystemFont, sans-serif`;
      const timestampY = artistY + (variant === 'story' ? 60 : 50);
      ctx.fillText(`🕐 ${song.offsetFormatted}`, width / 2, timestampY);
    }

    // App branding
    const brandingY = height - (variant === 'story' ? 200 : 120);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${variant === 'story' ? '48px' : '36px'} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText('Syncify', width / 2, brandingY);

    ctx.fillStyle = '#a0a0a0';
    ctx.font = `${variant === 'story' ? '28px' : '24px'} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText('Perfect Sync, Every Time', width / 2, brandingY + (variant === 'story' ? 50 : 40));

    // Add viral hashtags
    const hashtagY = brandingY + (variant === 'story' ? 120 : 80);
    ctx.fillStyle = '#00d4aa';
    ctx.font = `${variant === 'story' ? '24px' : '20px'} -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillText('#SyncYourSound #MusicDiscovery #Viral', width / 2, hashtagY);

    // Add QR code placeholder area (for future implementation)
    if (variant === 'story') {
      const qrSize = 120;
      const qrX = width - qrSize - 40;
      const qrY = 40;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(qrX, qrY, qrSize, qrSize);
      
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QR', qrX + qrSize / 2, qrY + qrSize / 2);
      ctx.fillText('SCAN ME', qrX + qrSize / 2, qrY + qrSize / 2 + 20);
    }

    // Convert canvas to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onCardGenerated(url);
      }
      setIsGenerating(false);
    }, 'image/png', 0.9);
  };

  // Helper function to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  useEffect(() => {
    generateCard();
  }, [song, variant, style]);

  return (
    <div className="hidden">
      <canvas
        ref={canvasRef}
        className="hidden"
        style={{ display: 'none' }}
      />
      {isGenerating && (
        <div className="text-xs text-gray-400">
          Generating story card...
        </div>
      )}
    </div>
  );
};