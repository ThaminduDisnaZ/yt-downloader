"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DownloadCloud, Loader2, CheckCircle } from 'lucide-react';

interface DownloadSectionProps {
  onDownload: () => void;
  isDownloading: boolean;
  progress: number;
  disabled: boolean;
}

const DownloadSection: FC<DownloadSectionProps> = ({ onDownload, isDownloading, progress, disabled }) => {
  const downloadComplete = progress === 100 && !isDownloading;

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6 shadow-lg">
      <h3 className="text-2xl font-semibold text-center text-foreground">Ready to Download?</h3>
      
      <Button 
        onClick={onDownload} 
        disabled={disabled || isDownloading || downloadComplete} 
        className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground"
        aria-label={downloadComplete ? "Download complete" : "Start download"}
      >
        {isDownloading ? (
          <>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Downloading...
          </>
        ) : downloadComplete ? (
          <>
            <CheckCircle className="mr-2 h-6 w-6" />
            Download Complete!
          </>
        ) : (
          <>
            <DownloadCloud className="mr-2 h-6 w-6" />
            Start Download
          </>
        )}
      </Button>

      {(isDownloading || downloadComplete) && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-3 [&>div]:bg-accent" aria-label={`Download progress: ${progress}%`} />
          <p className="text-sm text-center text-muted-foreground">{progress}% complete</p>
        </div>
      )}
      {disabled && !isDownloading && !downloadComplete && (
        <p className="text-sm text-center text-muted-foreground">Select at least one format to enable download.</p>
      )}
    </div>
  );
};

export default DownloadSection;
