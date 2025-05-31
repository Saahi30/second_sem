const GEMINI_API_KEY = 'AIzaSyB42vuVtTTkggBWy354DmqZjEA3EoxM-G0';
const GEMINI_MODEL = 'gemini-2.0-flash-lite';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export async function fetchAstronomyEvent(date: string): Promise<string> {
  const prompt = `Tell me about a significant astronomical event that happened on ${date}. Give a concise but informative summary.`;
  const res = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No event found.';
}

export async function chatWithGemini(messages: {role: 'user'|'model', content: string}[]): Promise<string> {
  // Gemini expects a conversation history
  const formatted = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));
  const res = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: formatted,
    }),
  });
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
}

export async function fetchTopSpaceNews(): Promise<{ headline: string; brief: string; source: string; }[]> {
  const prompt = `Give me the top 5 latest news headlines about space and astronomy. For each, provide:\n1. The headline\n2. A 2-3 sentence brief summary\n3. A credible source link (real or plausible, e.g. NASA, ESA, major science news)\nFormat as JSON array: [{ "headline": "...", "brief": "...", "source": "..." }, ...]`;
  const res = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await res.json();
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  // Remove code block markers and extract JSON array
  text = text.replace(/^[^\[]*([\[].*[\]])[^\]]*$/s, '$1');
  try {
    const json = JSON.parse(text);
    if (Array.isArray(json)) return json;
    return [];
  } catch {
    return [];
  }
}

export async function fetchSunMoonTimes(date: string, lat: number, lon: number): Promise<{sunrise: string, sunset: string, moonrise: string, moonset: string}> {
  const prompt = `For the location at latitude ${lat} and longitude ${lon}, what are the sunrise, sunset, moonrise, and moonset times on ${date}? Give the answer as a JSON object with keys sunrise, sunset, moonrise, and moonset, and use 24-hour time.`;
  const res = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const data = await res.json();
  let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  text = text.replace(/^[^\{]*({[\s\S]*})[^\}]*$/s, '$1');
  try {
    const json = JSON.parse(text);
    return {
      sunrise: json.sunrise || 'N/A',
      sunset: json.sunset || 'N/A',
      moonrise: json.moonrise || 'N/A',
      moonset: json.moonset || 'N/A',
    };
  } catch {
    return { sunrise: 'N/A', sunset: 'N/A', moonrise: 'N/A', moonset: 'N/A' };
  }
}

export async function fetchNasaApod(date: string): Promise<{ title: string; explanation: string; url: string }> {
  const apiKey = '4yhT8NUtDnOQxtGYTMcvPFeFHPnDAqIdJQcYuUFX';
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch APOD');
  const data = await res.json();
  return {
    title: data.title || '',
    explanation: data.explanation || '',
    url: data.url || '',
  };
}

export async function fetchRecentApodImages(days: number = 10): Promise<{ url: string; title: string }[]> {
  const apiKey = '4yhT8NUtDnOQxtGYTMcvPFeFHPnDAqIdJQcYuUFX';
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (days - 1));
  const format = (d: Date) => d.toISOString().split('T')[0];
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${format(startDate)}&end_date=${format(endDate)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch APOD images');
  const data = await res.json();
  // Filter for images only (not videos)
  return (Array.isArray(data) ? data : [data])
    .filter((item: any) => item.media_type === 'image')
    .map((item: any) => ({ url: item.url, title: item.title }));
} 