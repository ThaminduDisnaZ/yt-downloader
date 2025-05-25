
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoTitle = searchParams.get('title') || 'unknown_video';
  const qualityLabel = searchParams.get('quality') || 'unknown_quality';
  const fileExtension = searchParams.get('ext') || 'txt';

  // Sanitize parameters for filename
  const safeVideoTitle = videoTitle.substring(0,50).replace(/[^a-zA-Z0-9_.-]/g, '_');
  const safeQualityLabel = qualityLabel.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const safeFileExtension = fileExtension.replace(/[^a-zA-Z0-9_.-]/g, '');


  const filename = `${safeVideoTitle}_${safeQualityLabel}.${safeFileExtension}.txt`; // Mocking as .txt file

  const content = `This is a server-generated placeholder file for the video: "${videoTitle}"
Format: ${qualityLabel}
File Type: ${fileExtension}
Original File Extension for Media: ${safeFileExtension}

This is a mock download from TubeSiphon's backend.
In a real application, this endpoint would fetch and process the actual video.`;

  const headers = new Headers();
  headers.set('Content-Type', 'text/plain;charset=utf-8');
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);

  return new NextResponse(content, { headers });
}
