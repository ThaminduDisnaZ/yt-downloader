
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const audioId = searchParams.get('audio_id');
  const continuationToken = searchParams.get('continuation_token');

  if (!audioId) {
    return NextResponse.json({ error: 'audio_id is required' }, { status: 400 });
  }
  // Continuation token might be optional for the first request, so we don't strictly require it here.
  // The API itself will decide. Let's ensure it's at least an empty string if not provided.
  const effectiveContinuationToken = continuationToken || '';


  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    console.error('RAPIDAPI_KEY is not set in environment variables.');
    return NextResponse.json({ error: 'API key not configured on server.' }, { status: 500 });
  }

  // Construct path ensuring tokens are URI encoded
  let apiPath = `/audio/videos/continuation?audio_id=${encodeURIComponent(audioId)}`;
  if (effectiveContinuationToken) {
    apiPath += `&continuation_token=${encodeURIComponent(effectiveContinuationToken)}`;
  }
  
  const targetUrl = `https://youtube-v2.p.rapidapi.com${apiPath}`;

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': rapidApiKey,
      'x-rapidapi-host': 'youtube-v2.p.rapidapi.com',
    },
  };

  try {
    const rapidApiResponse = await fetch(targetUrl, options);

    if (!rapidApiResponse.ok) {
      const errorBody = await rapidApiResponse.text();
      console.error(`RapidAPI error: ${rapidApiResponse.status}`, errorBody);
      return NextResponse.json({ error: `Failed to fetch from RapidAPI: ${rapidApiResponse.status}`, details: errorBody }, { status: rapidApiResponse.status });
    }

    // Assuming the API returns JSON, as suggested by your example's Buffer.toString()
    const responseData = await rapidApiResponse.json();
    
    // This route returns the JSON from RapidAPI.
    // The client-side will need to process this to actually initiate a download
    // (e.g., if responseData contains a direct media URL).
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Error in /api/get-youtube-audio-data:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
