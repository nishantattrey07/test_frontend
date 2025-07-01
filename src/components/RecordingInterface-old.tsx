import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isActive: boolean;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();

  useEffect(() => {
    if (isActive && canvasRef.current) {
      initializeAudioContext();
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isActive]);

  const initializeAudioContext = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
    } catch (error) {
      // console.error('Error accessing microphone:', error);
    }
  };

  const animate = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Clear canvas with subtle glow
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Enhanced waveform bars with glow effect
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
      
      // Create enhanced gradient with glow
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
      gradient.addColorStop(0, '#00d4aa');
      gradient.addColorStop(0.5, '#00f5d4');
      gradient.addColorStop(1, '#01a3ff');
      
      // Add glow effect
      ctx.shadowColor = '#00d4aa';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      // Reset shadow for next iteration
      ctx.shadowBlur = 0;
      
      x += barWidth + 2;
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={320}
        height={80}
        className="w-full h-20 rounded-2xl"
        style={{ 
          filter: 'blur(0.5px)',
          background: 'linear-gradient(90deg, rgba(0,212,170,0.1) 0%, rgba(1,163,255,0.1) 100%)'
        }}
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="waveform-bar w-1.5 rounded-full"
                style={{
                  height: `${Math.random() * 40 + 10}px`,
                  animationDelay: `${i * 50}ms`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Decorative elements */}
      <div className="absolute -top-2 -left-2 w-4 h-4 bg-holographic-start/30 rounded-full blur-sm animate-float"></div>
      <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-holographic-end/30 rounded-full blur-sm animate-float animation-delay-700"></div>
    </div>
  );
};

export default WaveformVisualizer;