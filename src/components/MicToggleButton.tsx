import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface MicToggleButtonProps {
  isMicEnabled: boolean;
  isCheckingPermission: boolean;
  onToggle: () => Promise<boolean>;
  onShowToast: (message: string) => void;
}

export const MicToggleButton: React.FC<MicToggleButtonProps> = ({ 
  isMicEnabled, 
  isCheckingPermission, 
  onToggle,
  onShowToast
}) => {
  const handleClick = async () => {
    if (isCheckingPermission) return;
    
    const result = await onToggle();
    
    // Show toast notifications for mic status changes
    if (result) {
      onShowToast('Microphone turned on');
    } else {
      onShowToast('Microphone turned off');
    }
  };

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
      {/* Slide Toggle Button */}
      <button
        onClick={handleClick}
        disabled={isCheckingPermission}
        className={`
          relative w-16 h-8 rounded-full
          transition-all duration-300 ease-out
          ${isCheckingPermission 
            ? 'opacity-70 cursor-not-allowed' 
            : 'hover:scale-105 active:scale-95'
          }
          ${isMicEnabled 
            ? 'bg-gradient-to-r from-accent-start to-accent-end shadow-glow' 
            : 'bg-red-600 border border-white/20'
          }
          touch-feedback
        `}
        style={{
          boxShadow: isMicEnabled 
            ? '0 0 15px rgba(0, 212, 170, 0.3)' 
            : '0 0 15px rgba(220, 38, 38, 0.3)'
        }}
      >
        {/* Sliding Circle */}
        <div 
          className={`
            absolute top-1 w-6 h-6 rounded-full
            transition-all duration-300 ease-out
            flex items-center justify-center
            ${isMicEnabled 
              ? 'translate-x-9 bg-white' 
              : 'translate-x-1 bg-white'
            }
          `}
        >
          {isCheckingPermission ? (
            <Loader2 className="w-3 h-3 text-gray-600 animate-spin" />
          ) : isMicEnabled ? (
            <Mic className="w-3 h-3 text-accent-start" />
          ) : (
            <MicOff className="w-3 h-3 text-red-600" />
          )}
        </div>
      </button>
    </div>
  );
};