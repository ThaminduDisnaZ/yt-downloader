"use client";

import type { FC } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from '@/components/ui/skeleton';

interface ThumbnailCarouselProps {
  thumbnails: string[];
  isLoading: boolean;
}

const ThumbnailCarousel: FC<ThumbnailCarouselProps> = ({ thumbnails, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" />
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex space-x-4 pb-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-[180px] w-[320px] rounded-lg" />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  }
  
  if (!thumbnails || thumbnails.length === 0) {
    return <p className="text-muted-foreground">No thumbnails available.</p>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-semibold">Available Thumbnails</h3>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border shadow-sm">
        <div className="flex space-x-4 p-4">
          {thumbnails.map((url, index) => (
            <div key={index} className="shrink-0">
              <Image
                src={url}
                alt={`Thumbnail ${index + 1}`}
                width={320}
                height={180}
                className="h-[180px] w-[320px] rounded-lg object-cover border border-muted shadow-md transition-transform hover:scale-105"
                data-ai-hint="video thumbnail"
                priority={index < 3} // Prioritize loading first few images
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default ThumbnailCarousel;
