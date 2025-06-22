import React from 'react';
import { Music } from 'lucide-react';

interface RecordButtonProps {
  onClick: () => void;
  disabled: boolean;
  isRecording: boolean;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ 
  onClick, 
  disabled, 
  isRecording 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-[min(280px,70vw)] h-[min(280px,70vw)] max-w-[320px] max-h-[320px]
        rounded-full relative overflow-hidden
        transition-all duration-300 ease-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
        ${isRecording ? 'animate-glow' : 'animate-pulse-slow'}
        shadow-2xl
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
        <Music 
          size={48} 
          className={`mb-3 ${isRecording ? 'animate-bounce-subtle' : ''}`}
        />
        <span className="text-xl font-semibold">
          {isRecording ? 'Listening...' : 'Tap to Find'}
        </span>
        <span className="text-sm text-text-secondary mt-1">
          {isRecording ? 'Recording audio' : 'Music in 7 seconds'}
        </span>
      </div>
      
      {/* Animated border when recording */}
      {isRecording && (
        <div className="absolute inset-0 rounded-full border-2 border-accent-start animate-spin-smooth opacity-70" />
      )}
    </button>
  );
};