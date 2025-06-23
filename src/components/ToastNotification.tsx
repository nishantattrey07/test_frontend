import React from 'react';
import { X, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import type { ToastData } from '../types';

interface ToastNotificationProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-error" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-accent-start" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-success/20';
      case 'error':
        return 'border-error/20';
      case 'warning':
        return 'border-yellow-400/20';
      default:
        return 'border-accent-start/20';
    }
  };

  return (
    <div
      className={`
        fixed top-40 left-1/2 z-50
        glass rounded-2xl p-3 shadow-lg
        animate-pop-in w-11/12 max-w-xs
        border ${getBorderColor()}
      `}
      style={{
        transform: 'translate(-50%, 0)'
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium leading-relaxed">
            {toast.message}
          </p>
        </div>
        
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors duration-200"
        >
          <X className="w-3 h-3 text-text-secondary hover:text-white" />
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <>
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </>
  );
};

export default ToastNotification;