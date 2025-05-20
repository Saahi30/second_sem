import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const apiKey = process.env.GEMINI_API_KEY;

  if (!lat || !lon || !apiKey) {
    return new Response(JSON.stringify({ error: 'Missing lat, lon, or Gemini API key.' }), { status: 400 });
  }

  const prompt = `You are an astronomy assistant. For the location at latitude ${lat} and longitude ${lon}, list:
1. The next 3 upcoming astronomical events (e.g., meteor showers, eclipses, planetary conjunctions, visible ISS passes, etc.) with date, title, and a short description.
2. The 3 most significant historical astronomical events for this location (e.g., past eclipses, meteor impacts, discoveries, etc.) with date, title, and a short description.
Return the result as a JSON array of objects with fields: title, date, description, type ('upcoming' or 'historical').`;

  try {
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    const geminiData = await geminiRes.json();
    // Try to extract JSON from the model's response
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let events: any[] = [];
    try {
      // Try to parse the first JSON array in the response
      const match = text.match(/\[.*\]/);
      if (match) {
        events = JSON.parse(match[0]);
        // Filter upcoming events to only those after today
        const today = getToday();
        events = events.filter((event: any) => {
          if (event.type === 'upcoming') {
            // Try to parse the event date
            const eventDate = new Date(event.date);
            return !isNaN(eventDate.getTime()) && eventDate > today;
          }
          return true; // keep historical events as is
        });
      }
    } catch {}
    return Response.json({ events });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from Gemini.' }), { status: 500 });
  }
}

function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
} 