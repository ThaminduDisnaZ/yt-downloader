
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
import type { VideoInfo, SelectedFormat } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';

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

    try {
      const response = await fetch('/api/fetch-youtube-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ details: "Failed to parse error from server."}));
        throw new Error(errorData.details || errorData.error || `Server error: ${response.status}`);
      }

      const data: VideoInfo = await response.json();
      if (!data || !data.id) {
        throw new Error("Received invalid video information from server.");
      }
      
      // Add a timestamp to thumbnail URLs to try and bypass browser caching if URLs are same for different videos
      const timestamp = new Date().getTime();
      const uniqueThumbnails = data.thumbnailUrls.map(thumbUrl => `${thumbUrl}${thumbUrl.includes('?') ? '&' : '?'}ts=${timestamp}`);

      setVideoInfo({...data, thumbnailUrls: uniqueThumbnails });
      toast({
        title: "Video Info Fetched!",
        description: data.title,
      });

    } catch (err: any) {
      console.error("Error fetching video info:", err);
      setError(err.message || "Failed to fetch video information. The URL might be invalid or the service is unavailable.");
      setVideoInfo(null);
      toast({
        title: "Error Fetching Video",
        description: err.message || "Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingVideoInfo(false);
    }
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
    
    let filesProcessed = 0;

    for (const format of selectedFormats) {
      if (videoInfo && format.downloadUrl) {
        try {
          // Sanitize title for filename
          const safeVideoTitle = videoInfo.title.substring(0,50).replace(/[^a-zA-Z0-9_.-]/g, '_');
          const safeQualityLabel = format.qualityLabel.replace(/[^a-zA-Z0-9_.-]/g, '_');
          const filename = `${safeVideoTitle}_${safeQualityLabel}.${format.fileExtension}`;
          
          // Create an anchor element to trigger download
          const a = document.createElement('a');
          a.href = format.downloadUrl;
          a.download = filename; // Suggest a filename to the browser
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          toast({
            title: `Download Initiated: ${format.qualityLabel}`,
            description: `Your browser is downloading: ${filename}`,
            variant: "default"
          });
          
        } catch (downloadError: any) {
           console.error(`Error downloading ${format.qualityLabel}:`, downloadError);
           toast({
            title: `Download Error: ${format.qualityLabel}`,
            description: downloadError.message || "Could not start download for this format.",
            variant: "destructive",
          });
        }
      } else if (videoInfo) {
        // Fallback to mock download API if no downloadUrl is present (should ideally not happen with the new API)
        console.warn(`No downloadUrl for format ${format.qualityLabel}, using mock download.`);
        const apiUrl = `/api/download?title=${encodeURIComponent(videoInfo.title)}&quality=${encodeURIComponent(format.qualityLabel)}&ext=${encodeURIComponent(format.fileExtension)}`;
        const a = document.createElement('a');
        a.href = apiUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
         toast({
            title: `Mock Download: ${format.qualityLabel}`,
            description: `Using fallback mock download.`,
            variant: "default"
          });
      }
      filesProcessed++;
      // Update progress based on files processed for simplicity
      setDownloadProgress(Math.round((filesProcessed / selectedFormats.length) * 100));
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between initiating downloads
    }
    
    // Ensure progress reaches 100 after all attempts
    setDownloadProgress(100);
    setIsDownloading(false);
    toast({
      title: "Download Process Finished",
      description: `All selected downloads have been initiated. Check your browser's download manager.`,
      variant: "default",
      className: "bg-accent text-accent-foreground border-accent",
      duration: 9000,
    });
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
