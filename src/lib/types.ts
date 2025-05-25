export interface VideoFormat {
  id: string;
  container: 'mp4' | 'webm' | 'mkv';
  qualityLabel: string; 
  resolution?: string; 
  fileExtension: 'mp4' | 'webm' | 'mkv';
  size: string; 
  type: 'video';
  bitrate?: number; // in kbps
  fps?: number;
  hasAudio: boolean;
}

export interface AudioFormat {
  id: string;
  container: 'mp3' | 'm4a' | 'ogg' | 'opus' | 'wav';
  qualityLabel: string; // e.g., 'Audio (128kbps)'
  fileExtension: 'mp3' | 'm4a' | 'ogg' | 'opus' | 'wav';
  size: string; // e.g., '10MB'
  type: 'audio';
  bitrate: number; // in kbps
}

export type MediaFormat = VideoFormat | AudioFormat;

export interface VideoInfo {
  id: string;
  title: string;
  duration: string; // e.g., '10:35'
  thumbnailUrls: string[];
  formats: MediaFormat[];
  description: string;
  author: string;
  viewCount: string;
}

export interface SelectedFormat extends MediaFormat {
  // any additional properties if needed for selection state
}
