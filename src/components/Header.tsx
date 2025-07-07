import { Radio } from 'lucide-react';
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full p-6 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-gradient-to-br from-accent-start to-accent-end">
          <Radio size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">
          Syncify
        </h1>
      </div>
      <p className="text-text-secondary text-sm">
        Perfect Sync, Every Time
      </p>
    </header>
  );
};