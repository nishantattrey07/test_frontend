import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorCardProps {
  message: string;
  onRetry: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ message, onRetry }) => {
  return (
    <div className="animate-slide-up w-full max-w-sm mx-auto">
      <div 
        className="p-6 rounded-2xl backdrop-blur-sm border border-error/30 mb-6"
        style={{
          background: `
            linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(22, 33, 62, 0.9)),
            radial-gradient(circle at 50% 50%, rgba(255, 107, 107, 0.1), transparent 50%)
          `,
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 0 1px rgba(255, 107, 107, 0.2)
          `
        }}
      >
        <div className="text-center">
          <div className="mb-4">
            <AlertCircle size={48} className="text-error mx-auto animate-shake" />
          </div>
          
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Couldn't Identify Song
          </h3>
          
          <p className="text-text-secondary mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-accent-start to-accent-end text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <RefreshCw size={18} />
              <span>Try Again</span>
            </button>
            
            <div className="text-xs text-text-secondary/70 space-y-1">
              <p>• Move closer to the audio source</p>
              <p>• Ensure the music is playing clearly</p>
              <p>• Try in a quieter environment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};