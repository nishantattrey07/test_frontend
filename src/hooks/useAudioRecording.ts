import { useState, useRef, useCallback } from 'react';
import { AudioVisualizationData } from '../types';

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<AudioVisualizationData>({
    frequencies: new Array(32).fill(0),
    volume: 0
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startVisualization = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateVisualization = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Get a subset of frequencies for visualization (32 bars)
      const step = Math.floor(bufferLength / 32);
      const frequencies = [];
      
      for (let i = 0; i < 32; i++) {
        const start = i * step;
        const end = start + step;
        let sum = 0;
        
        for (let j = start; j < end && j < bufferLength; j++) {
          sum += dataArray[j];
        }
        
        frequencies.push((sum / step) / 255); // Normalize to 0-1
      }
      
      // Calculate overall volume
      const volume = frequencies.reduce((acc, freq) => acc + freq, 0) / frequencies.length;
      
      setAudioData({ frequencies, volume });
      
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateVisualization);
      }
    };

    updateVisualization();
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);
  const startRecording = useCallback(async (): Promise<Blob | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });
      
      streamRef.current = stream;
      setIsRecording(true);

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      startVisualization();

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      return new Promise((resolve) => {
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          resolve(audioBlob);
        };

        mediaRecorder.start();
        
        // Stop recording after 5 seconds
        setTimeout(() => {
          stopRecording();
        }, 5000);
      });
      
    } catch (error) {
      // console.error('Error starting recording:', error);
      setIsRecording(false);
      return null;
    }
  }, [startVisualization,stopRecording]);

  

  return {
    isRecording,
    audioData,
    startRecording,
    stopRecording
  };
};