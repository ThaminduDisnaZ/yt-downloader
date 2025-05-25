
import { type NextRequest, NextResponse } from 'next/server';

// Helper function to safely get string or default
const getString = (value: any, defaultValue = ''): string => (typeof value === 'string' ? value : defaultValue);
const getNumber = (value: any, defaultValue = 0): number => (typeof value === 'number' ? value : defaultValue);
const getBoolean = (value: any, defaultValue = false): boolean => (typeof value === 'boolean' ? value : defaultValue);

interface RawApiThumbnail {
  url: string;
  width: number;
  height: number;
}

interface RawApiFormatVideo {
  itag: number;
  quality: string;
  mimeType: string; // e.g. "video/mp4; codecs=\"avc1.640028\""
  width?: number;
  height?: number;
  fps?: number;
  size: number; // Bytes
  sizeFormatted: string;
  hasVideo: boolean;
  hasAudio: boolean;
  url: string; // Download URL
  extension: string;
}

interface RawApiFormatAudio {
  itag: number;
  quality: string;
  mimeType: string; // e.g. "audio/mp4; codecs=\"mp4a.40.2\""
  size: number; // Bytes
  sizeFormatted: string;
  hasVideo: boolean;
  hasAudio: boolean;
  url: string; // Download URL
  extension: string;
  bitrateAudio?: number; // kbps
}

interface RawApiResponseData {
  videoId?: string;
  title?: string;
  channelId?: string;
  channelName?: string; // Author
  description?: string;
  duration?: number; // seconds
  durationFormatted?: string;
  thumbnail?: RawApiThumbnail[];
  media?: {
    video?: RawApiFormatVideo[];
    audio?: RawApiFormatAudio[];
  };
  // Other fields like viewCount might not be consistently available
}


export async function POST(request: NextRequest) {
  const body = await request.json();
  const videoUrl = body.videoUrl;

  if (!videoUrl) {
    return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 });
  }

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    console.error('RAPIDAPI_KEY is not set in environment variables.');
    return NextResponse.json({ error: 'API key not configured on server.' }, { status: 500 });
  }

  const encodedParams = new URLSearchParams();
  encodedParams.set('query', videoUrl);

  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': rapidApiKey,
      'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encodedParams,
  };

  try {
    const rapidApiResponse = await fetch('https://youtube-media-downloader.p.rapidapi.com/v2/misc/list-items', options);

    if (!rapidApiResponse.ok) {
      const errorBody = await rapidApiResponse.text();
      console.error(`RapidAPI error: ${rapidApiResponse.status}`, errorBody);
      return NextResponse.json({ error: `Failed to fetch from RapidAPI: ${rapidApiResponse.status}`, details: errorBody }, { status: rapidApiResponse.status });
    }

    const responseData = await rapidApiResponse.json();

    // The API might return data directly or under a 'responseData' field, or an 'items' array.
    // This specific API tends to have a structure like { status, message, responseData: { actual_video_data } }
    // or { status, message, responseData: [item1, item2] } if query was a search term
    // For a URL query, we expect a single item structure.
    let rawVideoInfo: RawApiResponseData | null = null;

    if (responseData.responseData) {
        if (Array.isArray(responseData.responseData) && responseData.responseData.length > 0) {
            rawVideoInfo = responseData.responseData[0] as RawApiResponseData;
        } else if (typeof responseData.responseData === 'object' && !Array.isArray(responseData.responseData)) {
            rawVideoInfo = responseData.responseData as RawApiResponseData;
        }
    } else if (typeof responseData === 'object' && responseData.videoId) {
        // Fallback if the structure is flatter
        rawVideoInfo = responseData as RawApiResponseData;
    }
    

    if (!rawVideoInfo || !rawVideoInfo.videoId) {
      console.error('Unexpected API response structure or videoId missing:', responseData);
      return NextResponse.json({ error: 'Failed to parse video information from API response' }, { status: 500 });
    }
    
    const videoInfo: import('@/lib/types').VideoInfo = {
      id: getString(rawVideoInfo.videoId),
      title: getString(rawVideoInfo.title),
      duration: getString(rawVideoInfo.durationFormatted, rawVideoInfo.duration ? new Date(rawVideoInfo.duration * 1000).toISOString().substr(11, 8) : 'N/A'),
      thumbnailUrls: rawVideoInfo.thumbnail?.map((t: RawApiThumbnail) => t.url) || [],
      description: getString(rawVideoInfo.description),
      author: getString(rawVideoInfo.channelName),
      viewCount: 'N/A', // This API might not provide view count reliably
      formats: [],
    };

    // Map video formats
    rawVideoInfo.media?.video?.forEach((format: RawApiFormatVideo) => {
      if (!format.url) return; // Skip if no download URL
      videoInfo.formats.push({
        id: getString(format.itag, `v_${format.quality}`),
        container: getString(format.extension),
        qualityLabel: getString(format.quality),
        resolution: format.width && format.height ? `${format.width}x${format.height}` : (getString(format.quality).split(' ')[0] || 'N/A'),
        fileExtension: getString(format.extension),
        size: getString(format.sizeFormatted, `${(format.size / (1024*1024)).toFixed(2)}MB`),
        type: 'video',
        fps: getNumber(format.fps),
        hasAudio: getBoolean(format.hasAudio),
        downloadUrl: getString(format.url),
      });
    });

    // Map audio formats
    rawVideoInfo.media?.audio?.forEach((format: RawApiFormatAudio) => {
      if (!format.url) return; // Skip if no download URL
      videoInfo.formats.push({
        id: getString(format.itag, `a_${format.quality}`),
        container: getString(format.extension),
        qualityLabel: getString(format.quality, `${format.bitrateAudio}kbps`),
        fileExtension: getString(format.extension),
        size: getString(format.sizeFormatted, `${(format.size / (1024*1024)).toFixed(2)}MB`),
        type: 'audio',
        bitrate: getNumber(format.bitrateAudio, parseInt(getString(format.quality, '128'))), // Attempt to parse bitrate from quality if not directly available
        downloadUrl: getString(format.url),
      });
    });

    return NextResponse.json(videoInfo);

  } catch (error: any) {
    console.error('Error in /api/fetch-youtube-info:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
