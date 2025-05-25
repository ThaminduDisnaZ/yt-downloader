"use client";

import { Loader2 } from 'lucide-react';
import type { FC } from 'react';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = 8, text }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 py-8">
      <Loader2 className={`h-${size} w-${size} animate-spin text-primary`} />
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
