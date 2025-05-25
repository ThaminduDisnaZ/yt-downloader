"use client";

import type { FC } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import type { RecommendThumbnailOutput } from '@/ai/flows/recommend-thumbnail';
import { Skeleton } from '@/components/ui/skeleton';

interface AiThumbnailRecommendationProps {
  onRecommend: () => void;
  recommendation: RecommendThumbnailOutput | null;
  isLoading: boolean;
  hasThumbnails: boolean;
}

const AiThumbnailRecommendation: FC<AiThumbnailRecommendationProps> = ({ onRecommend, recommendation, isLoading, hasThumbnails }) => {
  return (
    <div className="space-y-4">
       <h3 className="text-xl font-semibold">AI Thumbnail Recommendation</h3>
      <Button onClick={onRecommend} disabled={isLoading || !hasThumbnails} size="lg" variant="outline">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Recommending...
          </>
        ) : (
          <>
            <Wand2 className="mr-2 h-5 w-5" />
            Recommend Best Thumbnail
          </>
        )}
      </Button>

      {isLoading && !recommendation && (
        <Card className="overflow-hidden shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      )}

      {recommendation && (
        <Card className="overflow-hidden shadow-lg bg-gradient-to-br from-primary/10 via-background to-background border-primary/30">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">AI's Pick!</CardTitle>
            <CardDescription>Our AI has analyzed the thumbnails and recommends this one for maximum engagement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendation.recommendedThumbnailUrl && (
              <Image
                src={recommendation.recommendedThumbnailUrl}
                alt="AI Recommended Thumbnail"
                width={480}
                height={270}
                className="w-full h-auto rounded-lg object-cover border-2 border-primary shadow-xl"
                data-ai-hint="recommended thumbnail"
              />
            )}
            <div>
              <h4 className="font-semibold text-foreground">Reason:</h4>
              <p className="text-muted-foreground italic">{recommendation.reason}</p>
            </div>
          </CardContent>
        </Card>
      )}
      {!isLoading && !recommendation && hasThumbnails && (
         <p className="text-muted-foreground">Click the button above to get an AI recommendation.</p>
      )}
       {!isLoading && !hasThumbnails && (
         <p className="text-muted-foreground">Fetch video info to see thumbnails and get recommendations.</p>
      )}
    </div>
  );
};

export default AiThumbnailRecommendation;
