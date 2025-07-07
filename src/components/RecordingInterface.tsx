import React, { useEffect, useState } from 'react';
import { Music, Zap } from 'lucide-react';

interface RecordingInterfaceProps {
  isRecording: boolean;
  isProcessing: boolean;
  recordingProgress: number;
  processingProgress: number;
  remainingTime: number;
  onClick: () => void;
  disabled: boolean;
}

export const RecordingInterface: React.FC<RecordingInterfaceProps> = ({
  isRecording,
  isProcessing,
  recordingProgress,
  processingProgress,
  remainingTime,
  onClick,
  disabled
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');

  // Dynamic messages based on state and progress
  useEffect(() => {
    if (isRecording) {
      if (recordingProgress <= 20) {
        setCurrentMessage('Listening...');
        setSubMessage(`${remainingTime} seconds remaining`);
      } else if (recordingProgress <= 60) {
        setCurrentMessage('Capturing audio...');
        setSubMessage('Analyzing sound patterns...');
      } else {
        setCurrentMessage('Almost there...');
        setSubMessage('Finalizing capture...');
      }
    } else if (isProcessing) {
      if (processingProgress <= 30) {
        setCurrentMessage('Analyzing...');
        setSubMessage('Processing audio fingerprint...');
      } else if (processingProgress <= 70) {
        setCurrentMessage('Searching...');
        setSubMessage('Scanning  Database');
      } else {
        setCurrentMessage('Matching...');
        setSubMessage('Finding your song...');
      }
    } else {
      setCurrentMessage('Tap to Find');
      setSubMessage('Find Music in 7 seconds');
    }
  }, [isRecording, isProcessing, recordingProgress, processingProgress, remainingTime]);

  const progress = isProcessing ? processingProgress : recordingProgress;
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] w-full max-w-full overflow-hidden">
      {/* Dynamic Header Messages */}
      <div className="text-center mb-8 z-20 relative">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isRecording || isProcessing ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-start to-accent-end animate-pulse">
              {currentMessage}
            </span>
          ) : (
            <span className="text-white">{currentMessage}</span>
          )}
        </h2>
        <p className="text-text-secondary text-sm">
          {subMessage}
        </p>
      </div>

      {/* Main Recording Circle Container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center max-w-full">
        
        {/* Expanding Ripple Effects - Pond-like circles */}
        {(isRecording || isProcessing) && (
          <>
            {/* Large ripples */}
            <div className="absolute w-full h-full rounded-full border-2 border-accent-start/30 animate-ripple-1"></div>
            <div className="absolute w-full h-full rounded-full border border-accent-end/20 animate-ripple-2" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute w-full h-full rounded-full border border-accent-start/15 animate-ripple-3" style={{animationDelay: '1s'}}></div>
            <div className="absolute w-full h-full rounded-full border border-accent-end/10 animate-ripple-4" style={{animationDelay: '1.5s'}}></div>
            
            {/* Medium ripples */}
            <div className="absolute w-4/5 h-4/5 rounded-full border border-accent-start/25 animate-ripple-2" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute w-4/5 h-4/5 rounded-full border border-accent-end/15 animate-ripple-3" style={{animationDelay: '0.8s'}}></div>
            
            {/* Small ripples */}
            <div className="absolute w-3/5 h-3/5 rounded-full border border-accent-start/20 animate-ripple-1" style={{animationDelay: '0.7s'}}></div>
            <div className="absolute w-3/5 h-3/5 rounded-full border border-accent-end/12 animate-ripple-4" style={{animationDelay: '1.2s'}}></div>
          </>
        )}

        {/* Rotating Scanner Rings */}
        {(isRecording || isProcessing) && (
          <svg className="absolute w-full h-full -rotate-90">
            <defs>
              <linearGradient id="scannerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4aa" />
                <stop offset="50%" stopColor="#00f5d4" />
                <stop offset="100%" stopColor="#01a3ff" />
              </linearGradient>
            </defs>
            
          </svg>
        )}

        {/* Main Progress Ring */}
        {(isRecording || isProcessing) && (
          <svg className="absolute w-full h-full -rotate-90">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4aa" />
                <stop offset="50%" stopColor="#00f5d4" />
                <stop offset="100%" stopColor="#01a3ff" />
              </linearGradient>
            </defs>
            
            {/* Background ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="4"
              fill="none"
            />
            
            {/* Progress ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-out"
              style={{
                filter: 'drop-shadow(0 0 12px rgba(0, 212, 170, 0.8))'
              }}
            />
          </svg>
        )}

        {/* Central Button */}
        <button
          onClick={onClick}
          disabled={disabled}
          className={`
            relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full z-10
            transition-all duration-300 ease-out
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
            ${(isRecording || isProcessing) ? '' : 'animate-pulse-slow'}
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
            {isProcessing ? (
              <Zap 
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? 36 : 48} 
                className="mb-3 text-accent-start animate-pulse"
              />
            ) : (
              <Music 
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? 36 : 48} 
                className="mb-3"
              />
            )}
            <span className="text-lg sm:text-xl font-semibold text-center px-2">
              {isProcessing ? 'Processing' : isRecording ? 'Listening...' : 'Tap to Find'}
            </span>
            {isRecording && (
              <span className="text-base sm:text-lg text-text-secondary mt-2">
                {remainingTime}
              </span>
            )}
          </div>
        </button>

        {/* Floating Particles */}
        {(isRecording || isProcessing) && (
          <>
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent-start/60 rounded-full animate-float"></div>
            <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-accent-end/50 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-accent-start/40 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-accent-end/60 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-accent-start/50 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-1/2 right-1/6 w-1 h-1 bg-accent-end/40 rounded-full animate-float" style={{animationDelay: '2.5s'}}></div>
          </>
        )}

        {/* Energy Burst Effects for Processing */}
        {isProcessing && (
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-start/10 to-accent-end/10 animate-pulse-glow"></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-accent-end/10 to-accent-start/10 animate-pulse-glow" style={{animationDelay: '0.5s'}}></div>
          </>
        )}
      </div>

      {/* Bottom Status Indicator */}
      {/* {(isRecording || isProcessing) && (
        <div className="mt-8 flex items-center justify-center space-x-2 z-20 relative">
          <div className="w-2 h-2 bg-accent-start rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-accent-start rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="w-2 h-2 bg-accent-start rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <span className="text-sm text-text-secondary ml-3">
            {isRecording ? 'Recording audio...' : 'Analyzing audio fingerprint...'}
          </span>
        </div>
      )} */}
    </div>
  );
};