import React from 'react';
import { AudioVisualizationData } from '../types';

interface WaveformVisualizerProps {
  audioData: AudioVisualizationData;
  isActive: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ 
  audioData, 
  isActive 
}) => {
  return (
    <div className="flex items-end justify-center gap-1 h-16 w-64">
      {audioData.frequencies.map((frequency, index) => (
        <div
          key={index}
          className={`w-2 bg-gradient-to-t from-accent-start to-accent-end rounded-full transition-all duration-150 ${
            isActive ? 'animate-waveform' : ''
          }`}
          style={{
            height: isActive 
              ? `${Math.max(8, frequency * 60)}px`
              : '8px',
            animationDelay: `${index * 50}ms`,
            opacity: isActive ? Math.max(0.3, frequency) : 0.3
          }}
        />
      ))}
    </div>
  );
};