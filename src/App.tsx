import { History, Radio } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ErrorCard } from './components/ErrorCard';
import { RecordButton } from './components/RecordButton';
import { RecordingInterface } from './components/RecordingInterface';
import { SongResult } from './components/SongResult';
import { MicToggleButton } from './components/MicToggleButton';
import { ToastContainer } from './components/ToastNotification';
import HistoryPanel from './components/HistoryPanel';
import { useAudioRecording } from './hooks/useAudioRecording';
import { useMicToggle } from './hooks/useMicToggle';
import { useToast } from './hooks/useToast';
import { musicAPI } from './services/musicApi';
import { storageService } from './services/storageService';
import { AppState, MatchResult, Song, MusicMatch } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>('initial');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [canRecord, setCanRecord] = useState(true);
  const [timeUntilNextRequest, setTimeUntilNextRequest] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [userInteraction, setUserInteraction] = useState<Event | null>(null);
  const { isRecording, startRecording, stopRecording } = useAudioRecording();
  const { isMicEnabled, isCheckingPermission, toggleMic } = useMicToggle();
  const { toasts, showError, showInfo, removeToast } = useToast();

  // Update recording progress
  useEffect(() => {
    if (!isRecording) return;

    const startTime = Date.now();
    const duration = 5000; // 5 seconds

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

  const handleStartRecording = useCallback(async (event?: Event) => {
    if (!canRecord) return;

    // Check if microphone is enabled
    if (!isMicEnabled) {
      showError('Microphone is off. Please turn it on to search music.');
      return;
    }

    // Store the trusted user interaction for later use
    if (event) {
      setUserInteraction(event);
    }

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
          // Convert Song to MusicMatch for history storage
          const musicMatch: MusicMatch = {
            id: result.song.id,
            title: result.song.title,
            artist: result.song.artist,
            album: result.song.album,
            albumArt: result.song.artwork,
            confidence: result.song.confidence * 100, // Convert to percentage
            timestamp: Date.now(),
            youtubeUrl: result.song.youtubeUrl || '#',
            spotifyUrl: result.song.spotifyUrl,
          };
          
          // Save to history
          storageService.saveToHistory(musicMatch);
          
          setCurrentSong(result.song);
          setAppState('result');
          
          // Haptic feedback on success
          if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
          }
        } else {
          setErrorMessage(result.error || 'Unknown error occurred');
          setAppState('error');
        }
      } else {
        setErrorMessage('Failed to record audio. Please check microphone permissions.');
        setAppState('error');
      }
    } catch (error) {
      // console.error('Recording error:', error);
      setErrorMessage('Recording failed. Please try again.');
      setAppState('error');
    }
  }, [canRecord, startRecording, isMicEnabled, showError]);

  const handleReset = useCallback(() => {
    stopRecording();
    setAppState('initial');
    setCurrentSong(null);
    setErrorMessage('');
    setRecordingProgress(0);
    setProcessingProgress(0);
    setUserInteraction(null); // Clear the stored interaction
  }, [stopRecording]);

  const handleShare = useCallback(() => {
    if (currentSong) {
      const shareText = `🎵 Just discovered "${currentSong.title}" by ${currentSong.artist} at ${currentSong.offsetFormatted} using SoundWave! Listen: ${currentSong.shareableUrl} #MusicDiscovery`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Music Discovery',
          text: shareText,
          url: currentSong.shareableUrl || window.location.href
        }).catch(err => {/* console.error(err) */});
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
              onClick={(event) => handleStartRecording(event)}
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
          <RecordingInterface
            isRecording={true}
            isProcessing={false}
            recordingProgress={recordingProgress}
            processingProgress={0}
            remainingTime={Math.ceil((100 - recordingProgress) * 0.05)}
            onClick={() => {}} // No click during recording
            disabled={true}
          />
        );

      case 'processing':
        return (
          <RecordingInterface
            isRecording={false}
            isProcessing={true}
            recordingProgress={100}
            processingProgress={processingProgress}
            remainingTime={0}
            onClick={() => {}} // No click during processing
            disabled={true}
          />
        );

      case 'result':
        return currentSong ? (
          <SongResult
            song={currentSong}
            onShare={handleShare}
            onTryAgain={handleReset}
            userInteraction={userInteraction}
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
        {/* Modified Header with History Button */}
        <header className="w-full p-6 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-accent-start to-accent-end">
              <Radio size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              SoundWave
            </h1>
          </div>
          <p className="text-text-secondary text-sm">
            Premium Music Discovery
          </p>
          
          {/* History Button - Top Right - Only show on main screen */}
          {appState === 'initial' && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/10"
            >
              <History className="w-5 h-5 text-white hover:text-accent-start transition-colors" />
            </button>
          )}
        </header>
        
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

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel onClose={() => setShowHistory(false)} />
      )}

      {/* Mic Toggle Button - Only show on main screen */}
      {appState === 'initial' && (
        <MicToggleButton
          isMicEnabled={isMicEnabled}
          isCheckingPermission={isCheckingPermission}
          onToggle={toggleMic}
          onShowToast={showInfo}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;