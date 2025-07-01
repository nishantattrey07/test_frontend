import { useState, useEffect, useCallback } from 'react';

export const useMicToggle = () => {
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);

  // Check microphone permission status
  const checkMicPermission = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      return false;
    }

    setIsCheckingPermission(true);
    
    try {
      // Try to get permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // If we got the stream, we have permission
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setIsMicEnabled(true);
      
      return true;
    } catch (error) {
      // console.log('Microphone permission denied or not available:', error);
      setHasPermission(false);
      setIsMicEnabled(false);
      
      return false;
    } finally {
      setIsCheckingPermission(false);
    }
  }, []);

  // Check permission status using navigator.permissions if available
  const checkPermissionStatus = useCallback(async () => {
    if ('permissions' in navigator && 'query' in navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        switch (permission.state) {
          case 'granted':
            setHasPermission(true);
            setIsMicEnabled(true);
            break;
          case 'denied':
            setHasPermission(false);
            setIsMicEnabled(false);
            break;
          case 'prompt':
            setHasPermission(null);
            setIsMicEnabled(false);
            break;
        }

        // Listen for permission changes
        permission.addEventListener('change', () => {
          checkPermissionStatus();
        });
      } catch (error) {
        // Fallback to getUserMedia check
        checkMicPermission();
      }
    } else {
      // Fallback to getUserMedia check
      checkMicPermission();
    }
  }, [checkMicPermission]);

  // Toggle microphone permission
  const toggleMic = useCallback(async () => {
    if (!isMicEnabled) {
      // Try to enable mic by requesting permission
      const granted = await checkMicPermission();
      return granted;
    } else {
      // Disable mic (just update state, we can't revoke permission)
      setIsMicEnabled(false);
      return false;
    }
  }, [isMicEnabled, checkMicPermission]);

  // Check permission on mount
  useEffect(() => {
    checkPermissionStatus();
  }, [checkPermissionStatus]);

  return {
    isMicEnabled,
    hasPermission,
    isCheckingPermission,
    toggleMic,
    checkMicPermission
  };
};