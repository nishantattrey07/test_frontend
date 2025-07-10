import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

export const useSyncMode = () => {
  const [syncMode, setSyncModeState] = useState<boolean>(false);

  useEffect(() => {
    const savedSyncMode = storageService.getSyncMode();
    setSyncModeState(savedSyncMode);
  }, []);

  const setSyncMode = (enabled: boolean) => {
    setSyncModeState(enabled);
    storageService.setSyncMode(enabled);
  };

  return {
    syncMode,
    setSyncMode
  };
};