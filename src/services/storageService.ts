import type { MusicMatch } from '../types';

class StorageService {
  private readonly sessionKey = 'musicfind_session_uuid';
  private readonly historyKey = 'musicfind_history';
  private readonly maxHistoryItems = 5;

  getSessionUUID(): string {
    let sessionUUID = localStorage.getItem(this.sessionKey);
    if (!sessionUUID) {
      sessionUUID = this.generateUUID();
      localStorage.setItem(this.sessionKey, sessionUUID);
    }
    return sessionUUID;
  }

  private generateUUID(): string {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  saveToHistory(match: MusicMatch): void {
    try {
      const history = this.getHistory();
      
      // Remove duplicate if exists
      const filteredHistory = history.filter(item => 
        !(item.title === match.title && item.artist === match.artist)
      );
      
      // Add new match at the beginning
      filteredHistory.unshift(match);
      
      // Keep only the most recent items
      const trimmedHistory = filteredHistory.slice(0, this.maxHistoryItems);
      
      localStorage.setItem(this.historyKey, JSON.stringify(trimmedHistory));
    } catch (error) {
      // console.error('Failed to save to history:', error);
    }
  }

  getHistory(): MusicMatch[] {
    try {
      const historyJson = localStorage.getItem(this.historyKey);
      if (!historyJson) return [];
      
      const history = JSON.parse(historyJson);
      return Array.isArray(history) ? history : [];
    } catch (error) {
      // console.error('Failed to load history:', error);
      return [];
    }
  }

  clearHistory(): void {
    try {
      localStorage.removeItem(this.historyKey);
    } catch (error) {
      // console.error('Failed to clear history:', error);
    }
  }

  // Analytics and preferences
  updateUserPreferences(preferences: Record<string, any>): void {
    try {
      localStorage.setItem('musicfind_preferences', JSON.stringify(preferences));
    } catch (error) {
      // console.error('Failed to save preferences:', error);
    }
  }

  getUserPreferences(): Record<string, any> {
    try {
      const prefs = localStorage.getItem('musicfind_preferences');
      return prefs ? JSON.parse(prefs) : {};
    } catch (error) {
      // console.error('Failed to load preferences:', error);
      return {};
    }
  }
}

export const storageService = new StorageService();