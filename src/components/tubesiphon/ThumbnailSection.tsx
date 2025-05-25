"use client";

import type { FC } from 'react';
import type { VideoInfo } from '@/lib/types';
import type { RecommendThumbnailOutput } from '@/ai/flows/recommend-thumbnail';
import { recommendThumbnail } from '@/ai/flows/recommend-thumbnail';
import ThumbnailCarousel from './ThumbnailCarousel';
import AiThumbnailRecommendation from './AiThumbnailRecommendation';
import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface ThumbnailSectionProps {
  videoInfo: VideoInfo | null;
  isLoadingVideoInfo: boolean;
}

const ThumbnailSection: FC<ThumbnailSectionProps> = ({ videoInfo, isLoadingVideoInfo }) => {
  const [recommendedThumbnail, setRecommendedThumbnail] = React.useState<RecommendThumbnailOutput | null>(null);
  const [isRecommending, setIsRecommending] = React.useState(false);
  const { toast } = useToast();

  const handleRecommendThumbnail = async () => {
    if (!videoInfo || !videoInfo.thumbnailUrls.length || !videoInfo.title || !videoInfo.description) {
      toast({
        title: "Missing Information",
        description: "Cannot recommend thumbnail without video title, description, and thumbnails.",
        variant: "destructive",
      });
      return;
    }
    setIsRecommending(true);
    setRecommendedThumbnail(null); 
    try {
      const result = await recommendThumbnail({
        thumbnailUrls: videoInfo.thumbnailUrls,
        videoTitle: videoInfo.title,
        videoDescription: videoInfo.description,
      });
      setRecommendedThumbnail(result);
      toast({
        title: "Recommendation Ready!",
        description: "AI has picked the best thumbnail.",
      });
    } catch (error) {
      console.error("Error recommending thumbnail:", error);
      toast({
        title: "Recommendation Failed",
        description: "Could not get AI thumbnail recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRecommending(false);
    }
  };
  
  const thumbnails = videoInfo?.thumbnailUrls || [];

  return (
    <div className="space-y-8">
      <ThumbnailCarousel thumbnails={thumbnails} isLoading={isLoadingVideoInfo} />
      <AiThumbnailRecommendation
        onRecommend={handleRecommendThumbnail}
        recommendation={recommendedThumbnail}
        isLoading={isRecommending}
        hasThumbnails={!isLoadingVideoInfo && !!videoInfo && thumbnails.length > 0}
      />
    </div>
  );
};

export default ThumbnailSection;
