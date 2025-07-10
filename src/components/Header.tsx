import { Radio, History } from 'lucide-react';
import React from 'react';
import { SyncModeToggle } from './SyncModeToggle';
import { useSyncMode } from '../hooks/useSyncMode';

interface HeaderProps {
  showHistoryButton?: boolean;
  showSyncToggle?: boolean;
  onHistoryClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  showHistoryButton = false,
  showSyncToggle = true,
  onHistoryClick 
}) => {
  const { syncMode, setSyncMode } = useSyncMode();

  return (
    <header className="w-full p-4 sm:p-6 relative">
      {/* Top section with controls - Only show if there are controls */}
      {(showSyncToggle || (showHistoryButton && onHistoryClick)) && (
        <div className="flex justify-between items-start mb-4">
          {/* Sync Mode Toggle - Left side */}
          <div className="flex-shrink-0">
            {showSyncToggle && (
              <SyncModeToggle enabled={syncMode} onToggle={setSyncMode} />
            )}
          </div>
          
          {/* History Button - Right side */}
          {showHistoryButton && onHistoryClick && (
            <button
              onClick={onHistoryClick}
              className="flex-shrink-0 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/10"
            >
              <History className="w-5 h-5 text-white hover:text-accent-start transition-colors" />
            </button>
          )}
        </div>
      )}
      
      {/* Main header content */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-accent-start to-accent-end">
            <Radio size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Syncify
          </h1>
        </div>
        <p className="text-text-secondary text-sm">
          Perfect Sync, Every Time
        </p>
      </div>
    </header>
  );
};