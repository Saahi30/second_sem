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