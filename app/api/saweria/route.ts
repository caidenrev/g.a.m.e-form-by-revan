import { NextResponse } from 'next/server';

export async function GET() {
  const STREAM_KEY = 'a362368a34e4f652436fe98bf70064eb';
  const API_URL = 'https://backend.saweria.co/widgets/leaderboard/all';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s server-side timeout

  try {
    const response = await fetch(API_URL, {
      headers: {
        'stream-key': STREAM_KEY,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Saweria API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform data to match our frontend interface if needed
    // The Saweria data format is: { data: [{ amount, currency, donator, is_user }] }
    // We can just return it as is or map it.
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Saweria data:', error);
    return NextResponse.json({ error: 'Failed to fetch donation data' }, { status: 500 });
  }
}
