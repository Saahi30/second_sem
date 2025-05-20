import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing Gemini API key.' }), { status: 400 });
  }
  try {
    const { question, lat, lon, events } = await req.json();
    if (!question || !lat || !lon) {
      return new Response(JSON.stringify({ error: 'Missing question, lat, or lon.' }), { status: 400 });
    }
    const context = events && Array.isArray(events) && events.length > 0
      ? `Here are some historical astronomical events for this location: ${JSON.stringify(events)}.`
      : 'No specific historical events are provided.';
    const prompt = `You are an astronomy assistant. The user is at latitude ${lat}, longitude ${lon}. ${context}\n\nUser question: ${question}\n\nAnswer in a friendly, informative way, referencing the provided events if relevant.`;
    const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    const geminiData = await geminiRes.json();
    const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return Response.json({ reply });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to get response from Gemini.' }), { status: 500 });
  }
} 