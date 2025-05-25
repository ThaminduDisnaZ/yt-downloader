
import { type NextRequest, NextResponse } from 'next/server';
import type { VideoInfo, MediaFormat, VideoFormat, AudioFormat } from '@/lib/types';

// Helper function to safely get string or default
const getString = (value: any, defaultValue = ''): string => (typeof value === 'string' ? value : defaultValue);
// const getNumber = (value: any, defaultValue = 0): number => (typeof value === 'number' ? value : defaultValue);
// const getBoolean = (value: any, defaultValue = false): boolean => (typeof value === 'boolean' ? value : defaultValue);

// Define a potential structure for media items from the new API
// This is a guess and might need adjustment based on the actual API response
interface RawApiMediaItem {
  url: string; // Download URL
  quality?: string; // e.g., "720p", "1080p", "128kbps"
  format?: string; // e.g., "MP4 video/audio", "M4A audio"
  extension?: string; // e.g., "mp4", "m4a"
  size?: number | string; // Size in bytes or formatted string
  type?: 'video' | 'audio' | string; // Explicit type or to be inferred
  videoAvailable?: boolean; // Clues for video content
  audioAvailable?: boolean; // Clues for audio content
  isHD?: boolean;
  // Add other potential fields based on observed API responses
}

interface RawApiResponseData {
  title?: string;
  description?: string;
  thumbnail?: string; // Assuming a single thumbnail URL, adjust if it's an array
  author?: string; // Or channelName
  duration?: string | number; // Duration in seconds or formatted string
  medias?: RawApiMediaItem[]; // Array of available media formats
  // Other fields based on observed API responses
}


export async function POST(request: NextRequest) {
  const body = await request.json();
  const videoUrl = body.url; // The new API expects 'url' in the JSON body

  if (!videoUrl) {
    return NextResponse.json({ error: 'url is required in the request body' }, { status: 400 });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    console.error('RAPIDAPI_KEY is not set in environment variables.');
    return NextResponse.json({ error: 'API key not configured on server.' }, { status: 500 });
  }

  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': rapidApiKey,
      'x-rapidapi-host': 'auto-download-all-in-one-big.p.rapidapi.com', // New API host
      'Content-Type': 'application/json', // New Content-Type
    },
    body: JSON.stringify({ url: videoUrl }), // New request body format
  };

  try {
    const rapidApiResponse = await fetch('https://auto-download-all-in-one-big.p.rapidapi.com/v1/social/autolink', options); // New API path

    if (!rapidApiResponse.ok) {
      const errorBody = await rapidApiResponse.text();
      console.error(`RapidAPI error: ${rapidApiResponse.status}`, errorBody);
      // Try to parse error JSON from RapidAPI if possible
      try {
        const parsedError = JSON.parse(errorBody);
        return NextResponse.json({ error: `Failed to fetch from RapidAPI: ${parsedError.message || rapidApiResponse.status}`, details: parsedError }, { status: rapidApiResponse.status });
      } catch (e) {
        return NextResponse.json({ error: `Failed to fetch from RapidAPI: ${rapidApiResponse.status}`, details: errorBody }, { status: rapidApiResponse.status });
      }
    }

    const responseData = await rapidApiResponse.json();

    // The actual data might be nested, e.g., under a 'data' field or be at the root.
    // This is a common pattern; adjust if the API is different.
    // Let's assume the main content is in responseData.data or responseData directly.
    const rawVideoInfoSource = responseData.data || responseData;


    if (!rawVideoInfoSource || (Array.isArray(rawVideoInfoSource.medias) && rawVideoInfoSource.medias.length === 0 && !rawVideoInfoSource.title)) {
        // If medias is an array but empty, and no title, likely not what we want, or could be an error structure.
        // Some APIs return a list of results, we might want the first one.
        if (Array.isArray(rawVideoInfoSource) && rawVideoInfoSource.length > 0) {
            // If responseData is an array, take the first element.
            // This can happen if the 'autolink' finds multiple processable links from a page.
            // We'll assume for a direct video URL, the relevant info is in the first item.
            const firstItem = rawVideoInfoSource[0];
            if (firstItem && firstItem.medias) {
                 const videoInfo: VideoInfo = {
                    id: getString(firstItem.id || videoUrl, videoUrl), // Use videoUrl or an API provided ID
                    title: getString(firstItem.title, 'Untitled Video'),
                    duration: typeof firstItem.duration === 'number' ? new Date(firstItem.duration * 1000).toISOString().substr(11, 8) : getString(firstItem.duration, 'N/A'),
                    thumbnailUrls: firstItem.thumbnail ? [getString(firstItem.thumbnail)] : [],
                    description: getString(firstItem.description),
                    author: getString(firstItem.author || firstItem.uploader),
                    viewCount: getString(firstItem.viewCount, 'N/A'),
                    formats: [],
                };
                if (Array.isArray(firstItem.medias)) {
                    firstItem.medias.forEach((media: RawApiMediaItem, index: number) => {
                        const commonFormat = {
                            id: getString(media.itag || `${media.type}_${index}`, `${media.type || 'media'}_${index}`),
                            container: getString(media.extension || media.format?.split(' ')[0].toLowerCase() || 'unknown'),
                            qualityLabel: getString(media.quality, media.format || 'Default Quality'),
                            fileExtension: getString(media.extension, 'unknown'),
                            size: typeof media.size === 'number' ? `${(media.size / (1024*1024)).toFixed(2)}MB` : getString(media.size, 'N/A'),
                            downloadUrl: getString(media.url),
                        };

                        // Infer type if not explicitly 'video' or 'audio'
                        let MimeType = media.type?.toLowerCase() || '';
                        if (!MimeType && media.format) MimeType = media.format.toLowerCase();
                        
                        const isVideo = media.videoAvailable === true || MimeType.includes('video') || (!MimeType.includes('audio') && (media.quality?.includes('p') || media.quality?.includes('x')));
                        const isAudio = media.audioAvailable === true || MimeType.includes('audio');


                        if (isVideo && commonFormat.downloadUrl) {
                            videoInfo.formats.push({
                                ...commonFormat,
                                type: 'video',
                                resolution: getString(media.quality?.includes('x') ? media.quality : undefined), // simplistic resolution detection
                                fps: undefined, // This API might not provide FPS
                                hasAudio: media.audioAvailable !== undefined ? media.audioAvailable : MimeType.includes('audio') || !MimeType.includes('video only'), // Guess if audio is present
                            } as VideoFormat);
                        } else if (isAudio && commonFormat.downloadUrl) {
                             videoInfo.formats.push({
                                ...commonFormat,
                                type: 'audio',
                                bitrate: parseInt(getString(media.quality, '128').replace('kbps','')), // simplistic bitrate detection
                            } as AudioFormat);
                        }
                    });
                }
                return NextResponse.json(videoInfo);

            }
        }
      console.error('Unexpected API response structure or no media found:', responseData);
      return NextResponse.json({ error: 'Failed to parse video information from API response. The API might not support this URL or the response structure changed.' }, { status: 500 });
    }
    
    const rawVideoInfo: RawApiResponseData = rawVideoInfoSource;

    const videoInfo: VideoInfo = {
      id: getString(videoUrl), // Use videoUrl as ID, or an API provided ID if available
      title: getString(rawVideoInfo.title, 'Untitled Video'),
      duration: typeof rawVideoInfo.duration === 'number' ? new Date(rawVideoInfo.duration * 1000).toISOString().substr(11, 8) : getString(rawVideoInfo.duration, 'N/A'),
      thumbnailUrls: rawVideoInfo.thumbnail ? [getString(rawVideoInfo.thumbnail)] : [], // Assuming single thumbnail
      description: getString(rawVideoInfo.description),
      author: getString(rawVideoInfo.author), // Or other field like 'uploader', 'channelName'
      viewCount: getString((rawVideoInfo as any).viewCount, 'N/A'), // If API provides view count
      formats: [],
    };
    
    if (Array.isArray(rawVideoInfo.medias)) {
      rawVideoInfo.medias.forEach((media: RawApiMediaItem, index: number) => {
        const commonFormat = {
          // Generate an ID if not available, or use a field like 'itag' if present
          id: getString((media as any).itag || `${media.type}_${index}`, `${media.type || 'media'}_${index}`),
          container: getString(media.extension || media.format?.split(' ')[0].toLowerCase() || 'unknown'),
          qualityLabel: getString(media.quality, media.format || 'Default Quality'),
          fileExtension: getString(media.extension, media.url?.split('.').pop()?.split('?')[0] || 'unknown'),
          size: typeof media.size === 'number' ? `${(media.size / (1024*1024)).toFixed(2)}MB` : getString(media.size, 'N/A'),
          downloadUrl: getString(media.url),
        };
        
        // Infer type if not explicitly 'video' or 'audio'
        let mediaType = media.type?.toLowerCase();
        if (!mediaType && media.format) mediaType = media.format.toLowerCase();
        if (!mediaType && media.url) {
            const ext = media.url.split('.').pop()?.toLowerCase();
            if (['mp4', 'webm', 'mkv', 'mov', 'avi', 'flv'].includes(ext || '')) mediaType = 'video';
            else if (['mp3', 'm4a', 'ogg', 'wav', 'aac', 'opus'].includes(ext || '')) mediaType = 'audio';
        }


        const isVideo = media.videoAvailable === true || mediaType === 'video' || (!mediaType?.includes('audio') && (media.quality?.includes('p') || media.quality?.includes('x')));
        const isAudioOnly = media.audioAvailable === true && media.videoAvailable === false || mediaType === 'audio';


        if (isVideo && commonFormat.downloadUrl) {
          videoInfo.formats.push({
            ...commonFormat,
            type: 'video',
            resolution: getString(media.quality?.includes('x') ? media.quality : undefined), 
            fps: undefined, // This API might not provide FPS
            hasAudio: media.audioAvailable !== undefined ? media.audioAvailable : !mediaType?.includes('no audio'), // Guess if audio is present
          } as VideoFormat);
        } else if (isAudioOnly && commonFormat.downloadUrl) {
           videoInfo.formats.push({
            ...commonFormat,
            type: 'audio',
            bitrate: parseInt(getString(media.quality, '128').replace(/\D/g,'')), // Extract numbers for bitrate
          } as AudioFormat);
        }
      });
    } else {
        console.warn("No 'medias' array found in the API response or it's not an array:", rawVideoInfo.medias);
    }

    if (videoInfo.formats.length === 0 && rawVideoInfo.medias && !Array.isArray(rawVideoInfo.medias) && typeof rawVideoInfo.medias === 'object') {
      // Fallback if 'medias' is a single object instead of an array
      // This is less common but good to handle
      const media = rawVideoInfo.medias as RawApiMediaItem;
       const commonFormat = {
          id: getString((media as any).itag || `${media.type}_0`, `${media.type || 'media'}_0`),
          container: getString(media.extension || media.format?.split(' ')[0].toLowerCase() || 'unknown'),
          qualityLabel: getString(media.quality, media.format || 'Default Quality'),
          fileExtension: getString(media.extension, media.url?.split('.').pop()?.split('?')[0] || 'unknown'),
          size: typeof media.size === 'number' ? `${(media.size / (1024*1024)).toFixed(2)}MB` : getString(media.size, 'N/A'),
          downloadUrl: getString(media.url),
        };
        let mediaType = media.type?.toLowerCase();
        if (!mediaType && media.url) {
            const ext = media.url.split('.').pop()?.toLowerCase();
            if (['mp4', 'webm', 'mkv'].includes(ext || '')) mediaType = 'video';
            else if (['mp3', 'm4a', 'ogg'].includes(ext || '')) mediaType = 'audio';
        }
        const isVideo = media.videoAvailable === true || mediaType === 'video';
        const isAudioOnly = media.audioAvailable === true && media.videoAvailable === false || mediaType === 'audio';

        if (isVideo && commonFormat.downloadUrl) {
          videoInfo.formats.push({ ...commonFormat, type: 'video', hasAudio: media.audioAvailable !== false } as VideoFormat);
        } else if (isAudioOnly && commonFormat.downloadUrl) {
          videoInfo.formats.push({ ...commonFormat, type: 'audio', bitrate: parseInt(getString(media.quality, '128').replace(/\D/g,'')) } as AudioFormat);
        }
    }


    if (videoInfo.formats.length === 0) {
        console.warn("No processable formats found for the video after attempting to parse API response:", responseData);
        // Potentially return an error or an empty formats list, depending on desired behavior
        // For now, we'll return what we have, even if formats is empty, but frontend should handle this.
    }

    return NextResponse.json(videoInfo);

  } catch (error: any) {
    console.error('Error in /api/fetch-youtube-info:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

    