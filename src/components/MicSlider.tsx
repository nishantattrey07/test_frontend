import { Mic, MicOff } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface MicSliderProps {
  isMicOn: boolean;
  onMicChange: (on: boolean) => void;
}

const MicSlider: React.FC<MicSliderProps> = ({ isMicOn, onMicChange }) => {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(isMicOn ? 1 : 0); // 0 = left (off), 1 = right (on)
  const trackRef = useRef<HTMLDivElement>(null);

  // Update position if parent changes isMicOn
  React.useEffect(() => {
    setPosition(isMicOn ? 1 : 0);
  }, [isMicOn]);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const rect = track.getBoundingClientRect();
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const newPos = x / rect.width;
    setPosition(newPos);
    if (newPos < 0.5 && isMicOn) onMicChange(false);
    if (newPos >= 0.5 && !isMicOn) onMicChange(true);
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true);
    handleDrag(e);
    document.body.style.userSelect = 'none';
  };

  const handleDragEnd = () => {
    setDragging(false);
    // Snap to nearest
    if (position < 0.5) {
      setPosition(0);
      if (isMicOn) onMicChange(false);
    } else {
      setPosition(1);
      if (!isMicOn) onMicChange(true);
    }
    document.body.style.userSelect = '';
  };

  React.useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        handleDrag(e as any);
      } else {
        handleDrag(e as any);
      }
    };
    const up = () => handleDragEnd();
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, [dragging, position, isMicOn]);

  // Thumb position in px
  const thumbLeft = `calc(${position * 100}% - 20px)`;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
      <div className="flex items-center space-x-4 mb-2">
        <MicOff className={`w-6 h-6 ${!isMicOn ? 'text-red-500' : 'text-gray-400'}`} />
        <span className="text-xs text-gray-400">Mic</span>
        <Mic className={`w-6 h-6 ${isMicOn ? 'text-green-500' : 'text-gray-400'}`} />
      </div>
      <div
        ref={trackRef}
        className="relative w-40 h-10 bg-gray-800 rounded-full flex items-center shadow-inner"
      >
        <div
          className={`absolute top-1/2 -translate-y-1/2 left-2 w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-200 ${!isMicOn ? 'bg-red-500/80' : 'bg-gray-600'}`}
        >
          <MicOff className="w-4 h-4 text-white" />
        </div>
        <div
          className={`absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-200 ${isMicOn ? 'bg-green-500/80' : 'bg-gray-600'}`}
        >
          <Mic className="w-4 h-4 text-white" />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: thumbLeft, transition: dragging ? 'none' : 'left 0.2s' }}
        >
          <button
            className={`w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border-2 ${isMicOn ? 'border-green-500' : 'border-red-500'} active:scale-95 transition-transform`}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            aria-label={isMicOn ? 'Turn mic off' : 'Turn mic on'}
          >
            {isMicOn ? <Mic className="w-6 h-6 text-green-500" /> : <MicOff className="w-6 h-6 text-red-500" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MicSlider; 