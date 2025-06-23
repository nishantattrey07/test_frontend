import { useState, useCallback } from 'react';
import type { ToastData } from '../types';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: ToastData['type'] = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastData = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showInfo = useCallback((message: string, duration?: number) => 
    showToast(message, 'info', duration), [showToast]);
    
  const showSuccess = useCallback((message: string, duration?: number) => 
    showToast(message, 'success', duration), [showToast]);
    
  const showError = useCallback((message: string, duration?: number) => 
    showToast(message, 'error', duration), [showToast]);
    
  const showWarning = useCallback((message: string, duration?: number) => 
    showToast(message, 'warning', duration), [showToast]);

  return {
    toasts,
    showToast,
    showInfo,
    showSuccess,
    showError,
    showWarning,
    removeToast,
    clearAllToasts
  };
};