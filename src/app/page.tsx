
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
import type { VideoInfo, SelectedFormat, MediaFormat, AudioFormat } from '@/lib/types'; // Added AudioFormat
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
  { 
    id: 'a_rapidapi_example', 
    container: 'm4a', // Assuming m4a based on example, adjust if needed
    qualityLabel: 'Audio (via RapidAPI)', 
    fileExtension: 'm4a', 
    bitrate: 128, // Placeholder
    size: 'Varies', 
    type: 'audio',
    // Using example values from your request for testing. Replace with dynamic values for real use.
    rapidApiAudioId: '8gVbCk4SPwoLeXo4TlN2bUFhRHcSC3l6OE5Tdm1BYUR3Ggt4bl9ob1RQS0pzUSIKEggIOxDA_4zNAyoKEggIOxDA_4zNAxoLeG5faG9UUEtKc1EogZKBocKFmYSVAQ%3D%3D',
    rapidApiContinuationToken: '4qmFsgL5AhIRRkVzZnZfYXVkaW9fcGl2b3QaxAJDQkI2a0FGRFFtTlJRa0p3UlhWbldrSkRhamhMUXpOc05rOUZOVlJrYlRGQ1dWVlNNMFZuZERWbGFtaFBWVE5hZEZGWFJrVmtlRzlNWlVjMVptRkhPVlZWUlhSTFl6RkZhVU5vU1VsRFJITlJkMUF0VFhwUlRYRkRhRWxKUTBSelVYZFFMVTE2VVUxcFJWRnZVRTVFYjNoT2VrVjVUbFJOTTAxRVdYcE9SRkY0UzJjd1MwTjZWbXRaTTFwTFZWVldkazF0UmxieUJWc0tUaElfQ2d0NWVqaE9VM1p0UVdGRWR4SUxlWG80VGxOMmJVRmhSSGNhQzNodVgyaHZWRkJMU25OUklnb1NDQWc3RU1EX2pNMERLZ29TQ0FnN0VNRF9qTTBER2d0NGJsOW9iMVJRUzBwelVTaUJrb0Dod29XWmhKVUKaAhxicm93c2UtZmVlZEZFc2Z2X2F1ZGlvX3Bpdm90',
  },
];

const MOCK_VIDEO_INFO: VideoInfo = {
  id: 'mock_video_id',
  title: 'Epic Nature Documentary - Mountains & Rivers',
  duration: '12:35',
  thumbnailUrls: [
    'https://placehold.co/480x270.png?text=Thumbnail+1',
    'https://placehold.co/480x270.png?text=Thumbnail+2',
    'https://placehold.co/480x270.png?text=Thumbnail+3',
    'https://placehold.co/480x270.png?text=Thumbnail+4',
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

    // Simulate API call for video info - this part does NOT use RapidAPI yet
    // as the provided RapidAPI endpoint is for audio streams, not general video info.
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
    if (selectedFormats.length === 0 || !videoInfo) {
      toast({
        title: "No Formats Selected",
        description: "Please select at least one format and ensure video info is loaded.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);
    setError(null);

    toast({
      title: "Download Process Started",
      description: `Preparing ${selectedFormats.length} file(s).`,
    });
    
    // Process downloads one by one
    for (const format of selectedFormats) {
      if (videoInfo) {
        const audioFormat = format as AudioFormat; // Type assertion
        if (format.type === 'audio' && audioFormat.rapidApiAudioId) {
          try {
            toast({ title: `Fetching audio data for: ${audioFormat.qualityLabel}`, description: "Using RapidAPI proxy..." });
            let url = `/api/get-youtube-audio-data?audio_id=${encodeURIComponent(audioFormat.rapidApiAudioId!)}`;
            if (audioFormat.rapidApiContinuationToken) {
              url += `&continuation_token=${encodeURIComponent(audioFormat.rapidApiContinuationToken!)}`;
            }

            const response = await fetch(url);
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ details: "Failed to parse error response from proxy."}));
              throw new Error(errorData.details || `Failed to fetch audio data via proxy: ${response.status}`);
            }
            
            const data = await response.json();
            // The 'data' variable now holds the JSON response from your RapidAPI endpoint.
            // You need to inspect this 'data' to find the actual audio stream URL or content.
            // For example, if data.streamUrl exists:
            // if (data.streamUrl) {
            //   const a = document.createElement('a');
            //   a.href = data.streamUrl;
            //   a.download = `${videoInfo.title}_${audioFormat.qualityLabel}.${audioFormat.fileExtension}`; // Ensure filename is safe
            //   document.body.appendChild(a);
            //   a.click();
            //   document.body.removeChild(a);
            //   toast({ title: "Audio Download Started!", description: audioFormat.qualityLabel });
            // } else {
            //   console.log("RapidAPI audio response:", data); // Log to see structure
            //   toast({ title: "Audio Data Received (See Console)", description: "Response from RapidAPI received. Check console for structure to implement actual download.", variant: "default" });
            // }
            console.log(`Data for ${audioFormat.qualityLabel}:`, data);
            toast({
              title: `Data for ${audioFormat.qualityLabel} (Check Console)`,
              description: "Response from RapidAPI received via proxy. Further handling needed for actual download.",
              variant: "default",
              duration: 9000,
            });

          } catch (err: any) {
            console.error("Error fetching from RapidAPI audio endpoint via proxy:", err);
            toast({ title: "Audio Fetch Error", description: err.message, variant: "destructive" });
          }
        } else {
          // Existing mock download logic for non-RapidAPI formats or video formats
          const apiUrl = `/api/download?title=${encodeURIComponent(videoInfo.title)}&quality=${encodeURIComponent(format.qualityLabel)}&ext=${encodeURIComponent(format.fileExtension)}`;
          const a = document.createElement('a');
          a.href = apiUrl;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
    }

    // Simulate overall progress after attempting all downloads
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 20;
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setDownloadProgress(100);
        setIsDownloading(false);
        toast({
          title: "Download Process Finished",
          description: `Browser should have handled downloads. Check console for RapidAPI responses.`,
          variant: "default",
          className: "bg-accent text-accent-foreground border-accent",
        });
      } else {
        setDownloadProgress(currentProgress);
      }
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
