import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Headphones, HelpCircle } from 'lucide-react';
import { EarbudPreferences } from '../types';
import { storageService } from '../services/storageService';

interface SettingsProps {
  onClose: () => void;
  onShowTutorial: () => void;
}

export const SettingsModal: React.FC<SettingsProps> = ({ onClose, onShowTutorial }) => {
  const [preferences, setPreferences] = useState<EarbudPreferences>({
    enabled: true,
    gesture: 'nexttrack',
    tutorialShown: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const prefs = storageService.getEarbudPreferences();
        setPreferences(prefs);
      } catch {
        // Use default preferences on error
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences when they change
  const handlePreferenceChange = (newPreferences: Partial<EarbudPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    storageService.saveEarbudPreferences(updatedPreferences);
  };

  const handleToggleEnabled = () => {
    handlePreferenceChange({ enabled: !preferences.enabled });
  };

  const handleShowTutorial = () => {
    onShowTutorial();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-primary-dark/90 backdrop-blur-sm border border-primary-highlight/30 rounded-2xl p-6 max-w-sm mx-4">
          <div className="animate-pulse text-center">
            <Settings className="w-8 h-8 text-accent-start mx-auto mb-2" />
            <p className="text-text-secondary">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div
        className="relative bg-primary-dark/90 backdrop-blur-sm border border-primary-highlight/30 rounded-2xl p-6 max-w-sm mx-4 w-full overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, rgba(26, 26, 46, 0.9), rgba(22, 33, 62, 0.95)),
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-primary-highlight/20 hover:bg-primary-highlight/40 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-text-primary" />
            </button>
            <h2 className="text-xl font-bold text-text-primary">Settings</h2>
            <div className="w-9" /> {/* Spacer for alignment */}
          </div>

          {/* Earbud Settings Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-accent-start/20">
                <Headphones className="w-5 h-5 text-accent-start" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Earbud Control</h3>
            </div>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary-highlight/10 border border-primary-highlight/20">
              <div className="flex-1">
                <h4 className="font-medium text-text-primary mb-1">Enable Music Discovery</h4>
                <p className="text-sm text-text-secondary">Use earbud gestures to start discovering music</p>
              </div>
              <button
                onClick={handleToggleEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  preferences.enabled 
                    ? 'bg-gradient-to-r from-accent-start to-accent-end' 
                    : 'bg-primary-highlight/40'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    preferences.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Gesture Mapping */}
            {preferences.enabled && (
              <div className="p-4 rounded-xl bg-primary-highlight/10 border border-primary-highlight/20">
                <h4 className="font-medium text-text-primary mb-2">Current Gesture Mapping</h4>
                <div className="flex items-center gap-3 text-sm">
                  <span className="px-3 py-1 bg-accent-start/20 text-accent-start rounded-full font-medium">
                    Next Track
                  </span>
                  <span className="text-text-secondary">→</span>
                  <span className="text-text-primary">Start Discovery</span>
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  Tap the "Next Track" button on your earbuds to start music discovery
                </p>
              </div>
            )}

            {/* Tutorial Button */}
            <button
              onClick={handleShowTutorial}
              className="w-full p-4 rounded-xl bg-primary-highlight/10 border border-primary-highlight/20 hover:bg-primary-highlight/20 transition-all duration-200 flex items-center gap-3"
            >
              <HelpCircle className="w-5 h-5 text-accent-start" />
              <div className="text-left">
                <h4 className="font-medium text-text-primary">How to Use Earbud Control</h4>
                <p className="text-sm text-text-secondary">Learn how to discover music with your earbuds</p>
              </div>
            </button>

            {/* Status Info */}
            <div className="p-3 rounded-lg bg-primary-highlight/5 border border-primary-highlight/10">
              <p className="text-xs text-text-secondary text-center">
                {preferences.enabled 
                  ? '🎧 Earbud control is active. Use Next Track gesture on the main screen.'
                  : '⏸️ Earbud control is disabled. Enable above to use gestures.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};