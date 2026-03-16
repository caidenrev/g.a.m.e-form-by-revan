import { NextResponse } from 'next/server';

export async function GET() {
  const STREAM_KEY = 'a362368a34e4f652436fe98bf70064eb';
  const API_URL = 'https://backend.saweria.co/widgets/leaderboard/all';

  try {
    const response = await fetch(API_URL, {
      headers: {
        'stream-key': STREAM_KEY,
      },
      next: { revalidate: 60 } // Reduce cache for testing
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: `Saweria API error: ${response.status}`,
        details: errorText.substring(0, 100)
      }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error fetching Saweria data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch donation data',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
