import React from 'react';
import { Music, Zap } from 'lucide-react';

interface RecordButtonProps {
  onClick: () => void;
  disabled: boolean;
  isRecording: boolean;
  isProcessing?: boolean;
  recordingProgress?: number;
  processingProgress?: number;
  remainingTime?: number;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ 
  onClick, 
  disabled, 
  isRecording,
  isProcessing = false,
  recordingProgress = 0,
  processingProgress = 0,
  remainingTime = 5
}) => {
  // Calculate radius based on button size (roughly half of button width minus some padding)
  const radius = 125; // Adjusted for 280px button
  const circumference = 2 * Math.PI * radius;
  const progress = isProcessing ? processingProgress : recordingProgress;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Neon Progress Ring - Show when recording or processing */}
      {(isRecording || isProcessing) && (
        <svg 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-90"
          width="min(320px, 75vw)"
          height="min(320px, 75vw)"
          viewBox="0 0 280 280"
        >
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d4aa" />
              <stop offset="50%" stopColor="#00f5d4" />
              <stop offset="100%" stopColor="#01a3ff" />
            </linearGradient>
          </defs>
          
          {/* Background ring */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="rgba(0, 212, 170, 0.1)"
            strokeWidth="4"
            fill="none"
          />
          
          {/* Animated progress ring */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="url(#neonGradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-200 ease-out ${isProcessing ? 'animate-pulse' : ''}`}
            style={{
              filter: 'drop-shadow(0 0 10px rgba(0, 212, 170, 0.8))'
            }}
          />
        </svg>
      )}

      {/* Main Button */}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          w-[min(280px,70vw)] h-[min(280px,70vw)] max-w-[280px] max-h-[280px]
          rounded-full relative overflow-hidden
          transition-all duration-300 ease-out
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
          ${(isRecording || isProcessing) ? '' : 'animate-pulse-slow'}
          shadow-2xl z-10
        `}
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(0, 212, 170, 0.3), transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(1, 163, 255, 0.2), transparent 50%),
            linear-gradient(135deg, #1a1a2e, #16213e)
          `,
          boxShadow: `
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2),
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(75, 94, 138, 0.2)
          `
        }}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary-highlight/20 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-text-primary">
          {isProcessing ? (
            <Zap 
              size={48} 
              className="mb-3 text-accent-start animate-pulse"
            />
          ) : (
            <Music 
              size={48} 
              className="mb-3"
            />
          )}
          <span className="text-xl font-semibold">
            {isProcessing ? 'Processing' : isRecording ? 'Listening...' : 'Tap to Find'}
          </span>
          {isRecording ? (
            <span className="text-lg text-text-secondary mt-2">
              {remainingTime}
            </span>
          ) : isProcessing ? (
            <span className="text-sm text-text-secondary mt-1">
              Analyzing...
            </span>
          ) : (
            <span className="text-sm text-text-secondary mt-1">
              Find Music in 7 seconds
            </span>
          )}
        </div>
      </button>
    </div>
  );
};