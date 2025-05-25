
export interface VideoFormat {
  id: string;
  container: 'mp4' | 'webm' | 'mkv' | string; // Allow string for flexibility from API
  qualityLabel: string; 
  resolution?: string; 
  fileExtension: 'mp4' | 'webm' | 'mkv' | string; // Allow string
  size: string; 
  type: 'video';
  bitrate?: number; // in kbps
  fps?: number;
  hasAudio: boolean;
  downloadUrl?: string; // Direct download URL from API
}

export interface AudioFormat {
  id: string;
  container: 'mp3' | 'm4a' | 'ogg' | 'opus' | 'wav' | string; // Allow string
  qualityLabel: string; // e.g., 'Audio (128kbps)'
  fileExtension: 'mp3' | 'm4a' | 'ogg' | 'opus' | 'wav' | string; // Allow string
  size: string; // e.g., '10MB'
  type: 'audio';
  bitrate: number; // in kbps
  downloadUrl?: string; // Direct download URL from API
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
  viewCount: string; // This might not be available from all APIs
}

export interface SelectedFormat extends MediaFormat {
  // any additional properties if needed for selection state
}
