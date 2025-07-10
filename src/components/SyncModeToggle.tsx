import React from 'react';
import { Zap, ZapOff } from 'lucide-react';

interface SyncModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const SyncModeToggle: React.FC<SyncModeToggleProps> = ({ enabled, onToggle }) => {
  return (
    <div className="group relative">
      {/* Mobile-first compact design */}
      <button
        onClick={() => onToggle(!enabled)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full
          transition-all duration-200 ease-in-out
          ${enabled 
            ? 'bg-gradient-to-r from-accent-start/20 to-accent-end/20 border border-accent-start/30' 
            : 'bg-primary-highlight/20 border border-primary-highlight/30'
          }
          hover:scale-105 backdrop-blur-sm
        `}
      >
        {/* Icon */}
        {enabled ? (
          <Zap size={16} className="text-accent-start" />
        ) : (
          <ZapOff size={16} className="text-text-secondary" />
        )}
        
        {/* Toggle switch */}
        <div className={`
          relative inline-flex h-5 w-9 items-center rounded-full
          transition-all duration-200 ease-in-out
          ${enabled 
            ? 'bg-gradient-to-r from-accent-start to-accent-end' 
            : 'bg-primary-highlight/40'
          }
        `}>
          <span
            className={`
              inline-block h-3.5 w-3.5 transform rounded-full
              bg-white shadow-sm transition-transform duration-200
              ${enabled ? 'translate-x-4' : 'translate-x-0.5'}
            `}
          />
        </div>
        
        {/* Text - hidden on very small screens, shown on sm+ */}
        <span className="hidden sm:inline text-text-secondary text-xs font-medium">
          Sync
        </span>
      </button>
      
      {/* Enhanced Tooltip - Positioned below button */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200
                      bg-primary-dark/95 backdrop-blur-sm text-text-primary text-xs px-3 py-2 rounded-lg
                      pointer-events-none z-30 border border-primary-highlight/30
                      shadow-xl max-w-[200px] sm:max-w-none">
        <div className="text-center">
          <div className="font-medium text-white">
            {enabled ? 'Sync Mode ON' : 'Sync Mode OFF'}
          </div>
          <div className="text-text-secondary mt-1 text-xs">
            {enabled 
              ? 'Continues Live from the time you heard it' 
              : 'Plays from detected moment'
            }
          </div>
        </div>
        {/* Tooltip arrow pointing up */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 
                        border-4 border-transparent border-b-primary-dark/95"></div>
      </div>
    </div>
  );
};