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
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      {/* Large Prominent Mic Button */}
      <button
        onClick={handleClick}
        disabled={isCheckingPermission}
        className={`
          relative w-16 h-16 rounded-full
          transition-all duration-300 ease-out
          flex items-center justify-center
          ${isCheckingPermission 
            ? 'opacity-70 cursor-not-allowed' 
            : 'hover:scale-110 active:scale-95'
          }
          ${isMicEnabled 
            ? 'bg-gradient-to-r from-accent-start to-accent-end' 
            : 'bg-red-600'
          }
          shadow-2xl border-2 border-white/20
          touch-feedback
        `}
        style={{
          boxShadow: isMicEnabled 
            ? '0 0 25px rgba(0, 212, 170, 0.5), 0 0 50px rgba(0, 212, 170, 0.2)' 
            : '0 0 25px rgba(220, 38, 38, 0.5), 0 0 50px rgba(220, 38, 38, 0.2)'
        }}
      >
        {/* Large Mic Icon */}
        {isCheckingPermission ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : isMicEnabled ? (
          <Mic className="w-8 h-8 text-white" />
        ) : (
          <MicOff className="w-8 h-8 text-white" />
        )}
        
        {/* Pulse Animation for Active State */}
        {isMicEnabled && !isCheckingPermission && (
          <div className="absolute inset-0 rounded-full bg-accent-start/30 animate-ping"></div>
        )}
      </button>
      
      {/* Status Text */}
      <div className="mt-2 text-center">
        <p className="text-xs text-text-secondary">
          {isCheckingPermission 
            ? 'Checking...' 
            : isMicEnabled 
              ? 'Mic On' 
              : 'Mic Off'
          }
        </p>
      </div>
    </div>
  );
};