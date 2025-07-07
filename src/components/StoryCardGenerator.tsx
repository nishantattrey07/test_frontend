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
    console.log('🎨 Generating story card for:', song.title);
    if (!canvasRef.current) {
      console.error('❌ Canvas ref not available');
      return;
    }
    
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Canvas context not available');
      return;
    }

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

    // Draw artwork section
    const artworkSize = variant === 'story' ? width * 0.6 : width * 0.4;
    const artworkX = (width - artworkSize) / 2;
    const artworkY = variant === 'story' ? height * 0.15 : height * 0.1;

    try {
      // Try to load external artwork
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const imageLoaded = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          console.log('⏰ Image loading timeout, using fallback');
          resolve(false);
        }, 3000); // 3 second timeout

        img.onload = () => {
          clearTimeout(timeout);
          console.log('✅ Image loaded successfully');
          resolve(true);
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          console.log('❌ Image failed to load, using fallback');
          resolve(false);
        };

        const imageUrl = song.artwork;
        console.log('🖼️ Loading artwork from:', imageUrl);
        img.src = imageUrl;
      });

      if (imageLoaded) {
        // Draw the loaded image
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(artworkX, artworkY, artworkSize, artworkSize, 20);
        } else {
          ctx.rect(artworkX, artworkY, artworkSize, artworkSize);
        }
        ctx.clip();
        ctx.drawImage(img, artworkX, artworkY, artworkSize, artworkSize);
        ctx.restore();
      } else {
        // Draw fallback artwork
        drawFallbackArtwork(ctx, artworkX, artworkY, artworkSize, song);
      }
    } catch (error) {
      console.error('❌ Failed to load artwork:', error);
      // Draw fallback artwork
      drawFallbackArtwork(ctx, artworkX, artworkY, artworkSize, song);
    }

    // Add artwork border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(artworkX, artworkY, artworkSize, artworkSize, 20);
    } else {
      ctx.rect(artworkX, artworkY, artworkSize, artworkSize);
    }
    ctx.stroke();

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

    // Add QR code area
    if (variant === 'story') {
      const qrSize = 100;
      const qrX = width - qrSize - 30;
      const qrY = 30;
      
      // QR code background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      if (ctx.roundRect) {
        ctx.roundRect(qrX, qrY, qrSize, qrSize, 10);
      } else {
        ctx.rect(qrX, qrY, qrSize, qrSize);
      }
      ctx.fill();
      
      // Simple QR-like pattern
      ctx.fillStyle = '#000000';
      const cellSize = qrSize / 10;
      
      // Generate a simple pattern based on song data
      const data = song.title + song.artist;
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          const hash = (data.charCodeAt((i * 10 + j) % data.length) + i + j) % 3;
          if (hash === 0) {
            ctx.fillRect(qrX + i * cellSize + 5, qrY + j * cellSize + 5, cellSize - 1, cellSize - 1);
          }
        }
      }
      
      // QR code corners
      const cornerSize = cellSize * 2;
      [[0, 0], [7, 0], [0, 7]].forEach(([cx, cy]) => {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(qrX + cx * cellSize + 5, qrY + cy * cellSize + 5, cornerSize, cornerSize);
        ctx.fillRect(qrX + cx * cellSize + 7, qrY + cy * cellSize + 7, cornerSize - 4, cornerSize - 4);
      });
      
      // QR code label
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Scan for App', qrX + qrSize / 2, qrY + qrSize + 15);
    }

    // Convert canvas to blob and create URL
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          console.log('✅ Story card generated successfully:', url);
          onCardGenerated(url);
        } else {
          console.error('❌ Failed to create blob from canvas');
        }
        setIsGenerating(false);
      }, 'image/png', 0.9);
    } catch (error) {
      console.error('❌ Canvas toBlob failed:', error);
      setIsGenerating(false);
    }
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
  }, [song.title, song.artist, song.artwork, variant, style]);

  // Helper method to draw fallback artwork
  const drawFallbackArtwork = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, song: Song) => {
    // Create a colorful gradient based on song title
    const colors = [
      ['#ff6b6b', '#ee5a24'],
      ['#4834d4', '#686de0'],
      ['#00d2d3', '#01a3a4'],
      ['#ff9ff3', '#f368e0'],
      ['#54a0ff', '#2e86de']
    ];
    
    const hash = song.title.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colorPair = colors[Math.abs(hash) % colors.length];
    
    const artworkGradient = ctx.createLinearGradient(x, y, x + size, y + size);
    artworkGradient.addColorStop(0, colorPair[0]);
    artworkGradient.addColorStop(1, colorPair[1]);
    
    ctx.fillStyle = artworkGradient;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, size, size, 20);
    } else {
      ctx.rect(x, y, size, size);
    }
    ctx.fill();

    // Add music note icon
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', x + size / 2, y + size / 2);
    
    // Add artist initials in smaller text
    const initials = song.artist.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
    ctx.font = `${size * 0.12}px Arial`;
    ctx.fillText(initials, x + size / 2, y + size / 2 + size * 0.2);
  };

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