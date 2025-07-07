import { useEffect } from 'react';
import { Song } from '../types';

export interface MetaTagsOptions {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: 'website' | 'music.song' | 'article';
  keywords?: string[];
  author?: string;
}

export class MetaTagsManager {
  private static setMetaTag(name: string, content: string, isProperty = false): void {
    const attribute = isProperty ? 'property' : 'name';
    let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute(attribute, name);
      document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
  }

  static updateTitle(title: string): void {
    document.title = title;
    this.setMetaTag('og:title', title, true);
    this.setMetaTag('twitter:title', title);
  }

  static updateDescription(description: string): void {
    this.setMetaTag('description', description);
    this.setMetaTag('og:description', description, true);
    this.setMetaTag('twitter:description', description);
  }

  static updateUrl(url: string): void {
    this.setMetaTag('og:url', url, true);
    
    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', url);
  }

  static updateImage(imageUrl: string): void {
    this.setMetaTag('og:image', imageUrl, true);
    this.setMetaTag('og:image:type', 'image/png', true);
    this.setMetaTag('og:image:width', '1200', true);
    this.setMetaTag('og:image:height', '630', true);
    this.setMetaTag('twitter:image', imageUrl);
    this.setMetaTag('twitter:card', 'summary_large_image');
  }

  static updateType(type: string): void {
    this.setMetaTag('og:type', type, true);
  }

  static updateKeywords(keywords: string[]): void {
    this.setMetaTag('keywords', keywords.join(', '));
  }

  static updateForSong(song: Song, options: Partial<MetaTagsOptions> = {}): void {
    const title = options.title || `${song.title} by ${song.artist} - Syncify`;
    const description = options.description || `🎵 Found "${song.title}" by ${song.artist} with Syncify! Listen${song.offsetFormatted ? ` from ${song.offsetFormatted}` : ''} and discover music in seconds.`;
    const url = options.url || window.location.href;
    const image = options.image || song.artwork;
    
    this.updateTitle(title);
    this.updateDescription(description);
    this.updateUrl(url);
    this.updateImage(image);
    this.updateType('music.song');
    
    // Music-specific meta tags
    this.setMetaTag('music:song', song.title, true);
    this.setMetaTag('music:musician', song.artist, true);
    this.setMetaTag('music:album', song.album, true);
    if (song.duration) {
      this.setMetaTag('music:duration', song.duration.toString(), true);
    }
    
    // Additional social media optimization
    this.setMetaTag('twitter:player', song.youtubeUrl || '', true);
    this.setMetaTag('twitter:player:width', '480', true);
    this.setMetaTag('twitter:player:height', '270', true);
    
    // Keywords for better SEO
    const keywords = [
      song.title,
      song.artist,
      song.album,
      'music identification',
      'song recognition',
      'Syncify',
      'music discovery',
      ...(song.genres || [])
    ].filter(Boolean);
    
    this.updateKeywords(keywords);
  }

  static updateForHomepage(): void {
    this.updateTitle('Syncify - Perfect Sync, Every Time');
    this.updateDescription('Discover music in seconds with our premium AI-powered music identification app');
    this.updateUrl(window.location.origin);
    this.updateImage(`${window.location.origin}/og-image.png`);
    this.updateType('website');
    this.updateKeywords(['music identification', 'song recognition', 'AI music', 'music discovery', 'Syncify']);
  }

  static generateStructuredData(song: Song): void {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "MusicRecording",
      "name": song.title,
      "byArtist": {
        "@type": "MusicGroup",
        "name": song.artist
      },
      "inAlbum": {
        "@type": "MusicAlbum",
        "name": song.album
      },
      "image": song.artwork,
      "url": song.shareableUrl,
      "sameAs": [
        song.youtubeUrl,
        song.spotifyUrl,
        song.appleMusicUrl
      ].filter(Boolean),
      "genre": song.genres || [],
      "duration": song.duration ? `PT${song.duration}S` : undefined,
      "recordingOf": {
        "@type": "MusicComposition",
        "name": song.title,
        "composer": song.artist
      }
    };

    // Remove undefined values
    const cleanedData = JSON.parse(JSON.stringify(structuredData));

    // Check if structured data already exists
    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    scriptTag.textContent = JSON.stringify(cleanedData);
  }

  static reset(): void {
    // Reset to default values
    this.updateForHomepage();
    
    // Remove music-specific meta tags
    const musicTags = [
      'music:song',
      'music:musician',
      'music:album',
      'music:duration',
      'twitter:player',
      'twitter:player:width',
      'twitter:player:height'
    ];
    
    musicTags.forEach(tag => {
      const metaTag = document.querySelector(`meta[property="${tag}"]`);
      if (metaTag) {
        metaTag.remove();
      }
    });
    
    // Remove structured data
    const scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (scriptTag) {
      scriptTag.remove();
    }
  }
}

// Hook for React components
export const useMetaTags = (options: MetaTagsOptions) => {
  useEffect(() => {
    const {
      title = 'Syncify - Perfect Sync, Every Time',
      description = 'Discover music in seconds with our premium AI-powered music identification app',
      url = window.location.href,
      image = `${window.location.origin}/og-image.png`,
      type = 'website',
      keywords = ['music identification', 'song recognition', 'AI music', 'music discovery', 'Syncify'],
      author = 'Syncify'
    } = options;

    MetaTagsManager.updateTitle(title);
    MetaTagsManager.updateDescription(description);
    MetaTagsManager.updateUrl(url);
    MetaTagsManager.updateImage(image);
    MetaTagsManager.updateType(type);
    MetaTagsManager.updateKeywords(keywords);
    MetaTagsManager.setMetaTag('author', author);

    // Cleanup function
    return () => {
      MetaTagsManager.reset();
    };
  }, [options]);
};

// Export for use in components
export default MetaTagsManager;