import { useState, useCallback, useEffect } from 'react';
import { AppState, Song, MatchResult } from './types';
import { useAudioRecording } from './hooks/useAudioRecording';
import { musicAPI } from './services/musicApi';
import { Header } from './components/Header';
import { RecordButton } from './components/RecordButton';
import { WaveformVisualizer } from './components/WaveformVisualizer';
import { ProgressRing } from './components/ProgressRing';
import { SongResult } from './components/SongResult';
import { ErrorCard } from './components/ErrorCard';
import { RotateCcw } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState<AppState>('initial');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [canRecord, setCanRecord] = useState(true);
  const [timeUntilNextRequest, setTimeUntilNextRequest] = useState(0);

  const { isRecording, audioData, startRecording, stopRecording } = useAudioRecording();

  // Update recording progress
  useEffect(() => {
    if (!isRecording) return;

    const startTime = Date.now();
    const duration = 7000; // 7 seconds

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setRecordingProgress(progress);

      if (progress < 100 && isRecording) {
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
  }, [isRecording]);

  // Check rate limiting
  useEffect(() => {
    const checkRateLimit = () => {
      const canMakeRequest = musicAPI.canMakeRequest();
      setCanRecord(canMakeRequest);
      
      if (!canMakeRequest) {
        const timeUntil = musicAPI.getTimeUntilNextRequest();
        setTimeUntilNextRequest(Math.ceil(timeUntil / 1000));
      }
    };

    checkRateLimit();
    const interval = setInterval(checkRateLimit, 1000);
    return () => clearInterval(interval);
  }, [appState]);

  const handleStartRecording = useCallback(async () => {
    if (!canRecord) return;

    setAppState('recording');
    setRecordingProgress(0);
    
    try {
      const audioBlob = await startRecording();
      
      if (audioBlob) {
        setAppState('processing');
        setProcessingProgress(0);
        
        // Animate processing progress
        const startTime = Date.now();
        const processingDuration = 3000; // 3 seconds average
        
        const updateProcessingProgress = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / processingDuration) * 100, 95);
          setProcessingProgress(progress);
          
          if (progress < 95) {
            requestAnimationFrame(updateProcessingProgress);
          }
        };
        
        updateProcessingProgress();
        
        // Identify the music
        const result: MatchResult = await musicAPI.identifyMusic(audioBlob);
        
        setProcessingProgress(100);
        
        if (result.success && result.song) {
          setCurrentSong(result.song);
          setAppState('result');
        } else {
          setErrorMessage(result.error || 'Unknown error occurred');
          setAppState('error');
        }
      } else {
        setErrorMessage('Failed to record audio. Please check microphone permissions.');
        setAppState('error');
      }
    } catch (error) {
      console.error('Recording error:', error);
      setErrorMessage('Recording failed. Please try again.');
      setAppState('error');
    }
  }, [canRecord, startRecording]);

  const handleReset = useCallback(() => {
    stopRecording();
    setAppState('initial');
    setCurrentSong(null);
    setErrorMessage('');
    setRecordingProgress(0);
    setProcessingProgress(0);
  }, [stopRecording]);

  const handleShare = useCallback(() => {
    if (currentSong) {
      const shareText = `🎵 Just discovered "${currentSong.title}" by ${currentSong.artist} using SoundWave! #MusicDiscovery`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Music Discovery',
          text: shareText,
          url: window.location.href
        }).catch(console.error);
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
          // Could show a toast notification here
          alert('Copied to clipboard!');
        });
      }
    }
  }, [currentSong]);

  const renderMainContent = () => {
    switch (appState) {
      case 'initial':
        return (
          <div className="text-center">
            <RecordButton
              onClick={handleStartRecording}
              disabled={!canRecord}
              isRecording={false}
            />
            
            {!canRecord && (
              <div className="mt-4 text-text-secondary text-sm">
                <p>Please wait {timeUntilNextRequest}s before trying again</p>
              </div>
            )}
            
            <div className="mt-8 max-w-xs mx-auto">
              <p className="text-text-secondary text-sm leading-relaxed">
                Hold your device near the music source and tap the button to identify any song in seconds.
              </p>
            </div>
          </div>
        );

      case 'recording':
        return (
          <div className="text-center">
            <div className="mb-6">
              <WaveformVisualizer audioData={audioData} isActive={isRecording} />
            </div>
            
            <div className="mb-6">
              <ProgressRing progress={recordingProgress} size={120} strokeWidth={6} />
            </div>
            
            <div className="text-text-primary">
              <h3 className="text-xl font-semibold mb-2">Listening...</h3>
              <p className="text-text-secondary">
                Recording audio • {Math.ceil((100 - recordingProgress) * 0.07)}s remaining
              </p>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center">
            <div className="mb-6">
              <RotateCcw size={48} className="text-accent-start mx-auto animate-spin-smooth" />
            </div>
            
            <div className="mb-6">
              <ProgressRing progress={processingProgress} size={120} strokeWidth={6} />
            </div>
            
            <div className="text-text-primary">
              <h3 className="text-xl font-semibold mb-2">Analyzing Audio</h3>
              <p className="text-text-secondary">
                Searching 50M songs...
              </p>
            </div>
          </div>
        );

      case 'result':
        return currentSong ? (
          <SongResult
            song={currentSong}
            onShare={handleShare}
            onTryAgain={handleReset}
          />
        ) : null;

      case 'error':
        return (
          <ErrorCard
            message={errorMessage}
            onRetry={handleReset}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: `
          radial-gradient(circle at 20% 20%, rgba(0, 212, 170, 0.1), transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(1, 163, 255, 0.05), transparent 50%),
          linear-gradient(135deg, #0f172a, #1a1a2e)
        `
      }}
    >
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-start/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-end/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            {renderMainContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center pb-6 px-6">
          <p className="text-text-secondary/60 text-xs">
            Audio processed and deleted immediately • Privacy protected
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;