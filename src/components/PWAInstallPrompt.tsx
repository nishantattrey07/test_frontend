import React from 'react';
import { Download, X, Smartphone, Zap, Music, Wifi } from 'lucide-react';

interface PWAInstallPromptProps {
  isVisible: boolean;
  isInstalling: boolean;
  onInstall: () => Promise<boolean>;
  onDismiss: () => void;
  trigger?: 'popup-blocked' | 'general' | 'repeat-user';
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  isVisible,
  isInstalling,
  onInstall,
  onDismiss,
  trigger = 'general'
}) => {
  if (!isVisible) return null;

  const getContextualMessage = () => {
    switch (trigger) {
      case 'popup-blocked':
        return {
          title: '🚀 Install for Better Experience',
          subtitle: 'Get automatic music opening and more!',
          description: 'Installing SoundWave lets you skip popup blockers and enjoy seamless music discovery.'
        };
      case 'repeat-user':
        return {
          title: '💫 Ready to Install SoundWave?',
          subtitle: 'You love using our app - make it yours!',
          description: 'Install for faster access, better performance, and enhanced features.'
        };
      default:
        return {
          title: '📱 Install SoundWave',
          subtitle: 'Get the full app experience',
          description: 'Install SoundWave for faster loading, offline access, and better music discovery.'
        };
    }
  };

  const { title, subtitle, description } = getContextualMessage();

  const benefits = [
    {
      icon: <Music className="w-5 h-5" />,
      text: 'Auto-open songs in YouTube Music',
      highlight: trigger === 'popup-blocked'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      text: 'Faster startup & performance',
      highlight: false
    },
    {
      icon: <Wifi className="w-5 h-5" />,
      text: 'Works offline',
      highlight: false
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      text: 'Native app experience',
      highlight: false
    }
  ];

  const handleInstall = async () => {
    const success = await onInstall();
    if (success) {
      // Optionally show success message
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center md:items-center animate-fade-in">
      <div 
        className="glass backdrop-premium rounded-t-4xl md:rounded-4xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-float-lg animate-slide-up"
        style={{
          background: `
            linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95)),
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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-accent-gradient rounded-2xl flex items-center justify-center shadow-glow">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-sm text-text-secondary">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="glass-card p-2 hover:bg-white/20 transition-all duration-200 group"
          >
            <X className="w-5 h-5 text-text-secondary group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            {description}
          </p>

          {/* Benefits List */}
          <div className="space-y-4 mb-6">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
              What you'll get:
            </h3>
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                  benefit.highlight 
                    ? 'bg-accent-start/20 border border-accent-start/30' 
                    : 'bg-white/5'
                }`}
              >
                <div className={`${
                  benefit.highlight ? 'text-accent-start' : 'text-text-secondary'
                }`}>
                  {benefit.icon}
                </div>
                <span className={`text-sm ${
                  benefit.highlight ? 'text-white font-medium' : 'text-text-secondary'
                }`}>
                  {benefit.text}
                </span>
                {benefit.highlight && (
                  <div className="ml-auto">
                    <span className="text-xs bg-accent-start/30 text-accent-start px-2 py-1 rounded-full">
                      Enhanced
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleInstall}
              disabled={isInstalling}
              className={`w-full bg-gradient-to-r from-accent-start to-accent-end text-white font-semibold py-4 px-4 rounded-xl flex items-center justify-center gap-3 hover:shadow-lg hover:scale-105 transition-all duration-200 ${
                isInstalling ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isInstalling ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Installing...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Install SoundWave</span>
                </>
              )}
            </button>
            
            <button
              onClick={onDismiss}
              className="w-full bg-white/10 text-text-secondary font-medium py-3 px-4 rounded-xl hover:bg-white/20 hover:text-white transition-all duration-200"
            >
              Maybe Later
            </button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-text-muted mt-4 text-center">
            Installing won't share any additional data • Free forever
          </p>
        </div>
      </div>
    </div>
  );
};