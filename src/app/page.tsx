
"use client";

import { useState, useEffect } from 'react';
import AppHeader from '@/components/tubesiphon/AppHeader';
import AppFooter from '@/components/tubesiphon/AppFooter';
import VideoUrlForm from '@/components/tubesiphon/VideoUrlForm';
import ThumbnailSection from '@/components/tubesiphon/ThumbnailSection';
import FormatSelector from '@/components/tubesiphon/FormatSelector';
import DownloadSection from '@/components/tubesiphon/DownloadSection';
import LoadingSpinner from '@/components/tubesiphon/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import type { VideoInfo, SelectedFormat, MediaFormat } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';

// Mock Data
const MOCK_VIDEO_FORMATS: MediaFormat[] = [
  { id: 'v_1080_mp4', container: 'mp4', qualityLabel: '1080p', resolution: '1920x1080', fileExtension: 'mp4', size: '150MB', type: 'video', fps: 30, hasAudio: true },
  { id: 'v_720_mp4', container: 'mp4', qualityLabel: '720p', resolution: '1280x720', fileExtension: 'mp4', size: '80MB', type: 'video', fps: 30, hasAudio: true },
  { id: 'v_1080_webm', container: 'webm', qualityLabel: '1080p (No Audio)', resolution: '1920x1080', fileExtension: 'webm', size: '120MB', type: 'video', fps: 60, hasAudio: false },
  { id: 'v_480_mp4', container: 'mp4', qualityLabel: '480p', resolution: '854x480', fileExtension: 'mp4', size: '40MB', type: 'video', fps: 30, hasAudio: true },
  { id: 'a_128_m4a', container: 'm4a', qualityLabel: 'Audio (AAC)', fileExtension: 'm4a', bitrate: 128, size: '10MB', type: 'audio' },
  { id: 'a_256_opus', container: 'opus', qualityLabel: 'Audio (Opus)', fileExtension: 'opus', bitrate: 160, size: '12MB', type: 'audio' },
];

const MOCK_VIDEO_INFO: VideoInfo = {
  id: 'mock_video_id',
  title: 'Epic Nature Documentary - Mountains & Rivers',
  duration: '12:35',
  thumbnailUrls: [
    'https://placehold.co/480x270.png?bg=3498db&text=Thumbnail+1',
    'https://placehold.co/480x270.png?bg=2ecc71&text=Thumbnail+2',
    'https://placehold.co/480x270.png?bg=e74c3c&text=Thumbnail+3',
    'https://placehold.co/480x270.png?bg=f1c40f&text=Thumbnail+4',
  ],
  formats: MOCK_VIDEO_FORMATS,
  description: 'A breathtaking journey through stunning mountain ranges and serene rivers. Witness nature like never before. This documentary explores the delicate ecosystems and the majestic beauty of our planet. Perfect for relaxation and learning about wildlife conservation.',
  author: 'Nature Explorers',
  viewCount: '1,234,567 views'
};


export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoadingVideoInfo, setIsLoadingVideoInfo] = useState(false);
  
  const [selectedFormats, setSelectedFormats] = useState<SelectedFormat[]>([]);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const handleFetchVideoInfo = async (url: string) => {
    setVideoUrl(url);
    setIsLoadingVideoInfo(true);
    setError(null);
    setVideoInfo(null);
    setSelectedFormats([]);
    setDownloadProgress(0);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (url.includes("fail")) {
      setError("Failed to fetch video information. The URL might be invalid or the video is private.");
      setVideoInfo(null);
      toast({
        title: "Error Fetching Video",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    } else {
      const timestamp = new Date().getTime();
      const uniqueThumbnails = MOCK_VIDEO_INFO.thumbnailUrls.map(thumbUrl => `${thumbUrl}&ts=${timestamp}`);
      
      setVideoInfo({...MOCK_VIDEO_INFO, thumbnailUrls: uniqueThumbnails });
       toast({
        title: "Video Info Fetched!",
        description: MOCK_VIDEO_INFO.title,
      });
    }
    setIsLoadingVideoInfo(false);
  };

  const handleDownload = async () => {
    if (selectedFormats.length === 0) {
      toast({
        title: "No Formats Selected",
        description: "Please select at least one format to download.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setError(null);

    toast({
      title: "Download Started",
      description: `Downloading ${selectedFormats.length} format(s).`,
    });

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          toast({
            title: "Download Complete!",
            description: `Your file(s) are being "downloaded".`,
            variant: "default",
            className: "bg-accent text-accent-foreground border-accent",
          });

          // Trigger actual file download for each selected format
          selectedFormats.forEach(format => {
            if (videoInfo) { 
              const content = `This is a placeholder file for the video: "${videoInfo.title}"\nFormat: ${format.qualityLabel}\nFile Type: ${format.fileExtension}\nOriginal Size: ${format.size}\n\nThis is a mock download from TubeSiphon.`;
              const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              
              // Sanitize qualityLabel for use in filename
              const safeQualityLabel = format.qualityLabel.replace(/[^a-zA-Z0-9_.-]/g, '_');
              // Sanitize video title for use in filename (simple version)
              const safeVideoTitle = videoInfo.title.substring(0,50).replace(/[^a-zA-Z0-9_.-]/g, '_');

              a.download = `${safeVideoTitle}_${safeQualityLabel}.${format.fileExtension}.txt`; // Add .txt to indicate it's a text placeholder
              
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <Card className="shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/80 to-primary/60 p-6">
            <CardTitle className="text-3xl font-bold text-primary-foreground">Download YouTube Videos</CardTitle>
            <CardDescription className="text-primary-foreground/90 text-sm">
              Enter a YouTube video URL below to get started. Fetch video information, get AI thumbnail recommendations, and select formats for download.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <VideoUrlForm onSubmit={handleFetchVideoInfo} isLoading={isLoadingVideoInfo} />
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="shadow-md">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoadingVideoInfo && (
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-1/4 rounded-md" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                 <Skeleton className="h-6 w-1/4 rounded-md" />
                <Skeleton className="h-10 w-1/2 rounded-md" />
                <Skeleton className="h-40 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
        )}

        {videoInfo && !isLoadingVideoInfo && (
          <>
            <Card className="shadow-xl overflow-hidden">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-semibold text-foreground">{videoInfo.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Author: {videoInfo.author} &bull; Duration: {videoInfo.duration} &bull; Views: {videoInfo.viewCount}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <ThumbnailSection videoInfo={videoInfo} isLoadingVideoInfo={isLoadingVideoInfo} />
                <FormatSelector
                  availableFormats={videoInfo.formats}
                  selectedFormats={selectedFormats}
                  onSelectionChange={setSelectedFormats}
                  isLoading={isLoadingVideoInfo}
                />
              </CardContent>
            </Card>

            <DownloadSection
              onDownload={handleDownload}
              isDownloading={isDownloading}
              progress={downloadProgress}
              disabled={selectedFormats.length === 0 || isLoadingVideoInfo}
            />
          </>
        )}
      </main>
      <AppFooter />
    </div>
  );
}

    