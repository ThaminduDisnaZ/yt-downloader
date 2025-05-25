"use client";

import type { FC } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MediaFormat, SelectedFormat, VideoFormat, AudioFormat } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileVideo, FileAudio, CheckCircle2, Download, HelpCircle, AlertTriangle, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FormatSelectorProps {
  availableFormats: MediaFormat[];
  selectedFormats: SelectedFormat[];
  onSelectionChange: (formats: SelectedFormat[]) => void;
  isLoading: boolean;
}

const FormatItem: FC<{
  format: MediaFormat;
  isSelected: boolean;
  onToggleSelect: (format: MediaFormat) => void;
}> = ({ format, isSelected, onToggleSelect }) => {
  const isVideo = format.type === 'video';
  const videoData = format as VideoFormat;
  const audioData = format as AudioFormat;

  return (
    <TableRow 
      key={format.id} 
      className={`transition-colors ${isSelected ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-muted/50'}`}
      onClick={() => onToggleSelect(format)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggleSelect(format)}
      aria-pressed={isSelected}
    >
      <TableCell className="w-12">
        <Checkbox
          id={`format-${format.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(format)}
          aria-labelledby={`label-${format.id}`}
          className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      </TableCell>
      <TableCell>
        <Label htmlFor={`format-${format.id}`} id={`label-${format.id}`} className="flex flex-col cursor-pointer">
          <span className="font-semibold text-foreground">
            {isVideo ? `${videoData.qualityLabel} (${videoData.fileExtension.toUpperCase()})` : `${audioData.qualityLabel} (${audioData.fileExtension.toUpperCase()})`}
          </span>
          <span className="text-xs text-muted-foreground">
            {isVideo ? videoData.resolution : `${audioData.bitrate}kbps`}
            {isVideo && !videoData.hasAudio && <Badge variant="outline" className="ml-2 text-xs border-destructive/50 text-destructive">No Audio</Badge>}
            {isVideo && videoData.fps && <Badge variant="outline" className="ml-2 text-xs">{videoData.fps} FPS</Badge>}
          </span>
        </Label>
      </TableCell>
      <TableCell className="text-right text-muted-foreground text-sm">{format.size}</TableCell>
    </TableRow>
  );
};


const FormatTable: FC<{
  formats: MediaFormat[];
  selectedFormats: SelectedFormat[];
  onToggleSelect: (format: MediaFormat) => void;
  type: 'video' | 'audio';
}> = ({ formats, selectedFormats, onToggleSelect, type }) => {
  const filteredFormats = formats.filter(f => f.type === type);

  if (filteredFormats.length === 0) {
    return <p className="p-4 text-center text-muted-foreground">No {type} formats available.</p>;
  }

  return (
    <ScrollArea className="h-[300px] rounded-md border shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Size</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFormats.map((format) => (
            <FormatItem
              key={format.id}
              format={format}
              isSelected={selectedFormats.some(sf => sf.id === format.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};


const FormatSelector: FC<FormatSelectorProps> = ({ availableFormats, selectedFormats, onSelectionChange, isLoading }) => {
  
  const handleToggleFormat = (format: MediaFormat) => {
    const currentIndex = selectedFormats.findIndex(sf => sf.id === format.id);
    const newSelectedFormats = [...selectedFormats];

    if (currentIndex === -1) {
      newSelectedFormats.push(format as SelectedFormat);
    } else {
      newSelectedFormats.splice(currentIndex, 1);
    }
    onSelectionChange(newSelectedFormats);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Select Formats for Download</h3>
      <Tabs defaultValue="video" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="video" className="text-base py-2.5">
            <FileVideo className="mr-2 h-5 w-5" /> Video
          </TabsTrigger>
          <TabsTrigger value="audio" className="text-base py-2.5">
            <FileAudio className="mr-2 h-5 w-5" /> Audio
          </TabsTrigger>
        </TabsList>
        <TabsContent value="video" className="mt-4">
          <FormatTable formats={availableFormats} selectedFormats={selectedFormats} onToggleSelect={handleToggleFormat} type="video" />
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700 flex items-start">
            <HelpCircle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Tip:</span> Some video formats (especially higher quality like WEBM) might not include audio. If you need audio, download an audio format separately or choose an MP4 format which usually includes audio.
            </div>
          </div>
        </TabsContent>
        <TabsContent value="audio" className="mt-4">
          <FormatTable formats={availableFormats} selectedFormats={selectedFormats} onToggleSelect={handleToggleFormat} type="audio" />
           <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 flex items-start">
            <Zap className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Note:</span> Audio formats are generally smaller and faster to download. Perfect for music or podcasts.
            </div>
          </div>
        </TabsContent>
      </Tabs>
      {selectedFormats.length > 0 && (
        <div className="p-3 bg-accent/10 border border-accent/30 rounded-md text-sm text-accent-foreground flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2 text-accent" />
          <span>{selectedFormats.length} format(s) selected for download.</span>
        </div>
      )}
    </div>
  );
};

export default FormatSelector;
