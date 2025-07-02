import { useState, useEffect, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  canInstall: boolean;
  isInstalled: boolean;
  isInstalling: boolean;
  showPrompt: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  promptInstall: () => Promise<boolean>;
  dismissPrompt: () => void;
  showInstallPrompt: () => void;
}

export const usePWAInstall = (): PWAInstallState => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check if running as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = 'standalone' in window.navigator && (window.navigator as any).standalone;
      
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      deferredPrompt.current = event;
      setCanInstall(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setShowPrompt(false);
      deferredPrompt.current = null;
      
      // Store installation status
      localStorage.setItem('soundwave_pwa_installed', 'true');
    };

    // Check if user previously dismissed install prompt
    const checkDismissalStatus = () => {
      const dismissed = localStorage.getItem('soundwave_pwa_dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      // Reset dismissal after 24 hours
      if (dismissed && Date.now() - dismissedTime > oneDayMs) {
        localStorage.removeItem('soundwave_pwa_dismissed');
      }
    };

    checkIfInstalled();
    checkDismissalStatus();

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt.current || isInstalling) {
      return false;
    }

    try {
      setIsInstalling(true);
      
      // Show the install prompt
      await deferredPrompt.current.prompt();
      
      // Wait for user choice
      const choiceResult = await deferredPrompt.current.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setCanInstall(false);
        setShowPrompt(false);
        return true;
      } else {
        // User dismissed, remember for 24 hours
        localStorage.setItem('soundwave_pwa_dismissed', Date.now().toString());
        setShowPrompt(false);
        return false;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    } finally {
      setIsInstalling(false);
      deferredPrompt.current = null;
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('soundwave_pwa_dismissed', Date.now().toString());
  };

  const showInstallPrompt = () => {
    // Don't show if already installed, can't install, or recently dismissed
    const dismissed = localStorage.getItem('soundwave_pwa_dismissed');
    
    if (!isInstalled && canInstall && !dismissed) {
      setShowPrompt(true);
    }
  };

  return {
    canInstall,
    isInstalled,
    isInstalling,
    showPrompt,
    installPrompt: deferredPrompt.current,
    promptInstall,
    dismissPrompt,
    showInstallPrompt
  };
};