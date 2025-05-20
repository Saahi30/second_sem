'use client';

import React from 'react';
import { useEffect, useState, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';

interface ApodData {
  url: string;
  title: string;
  date: string;
  explanation: string;
}

interface AstronomyData {
  sunrise: string;
  sunset: string;
  moon_phase: string;
}

interface GeminiEvent {
  title: string;
  date: string;
  description: string;
  type: 'upcoming' | 'historical';
}

interface GeminiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Calculate luminance of RGB color
function getLuminance(r: number, g: number, b: number): number {
  // Convert to sRGB
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  // Calculate luminance
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

// Analyze image average luminance to decide if dark or light background
async function isImageDarkFromUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Needed for cross-origin images to allow canvas access
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(true); // fallback dark
        return;
      }
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let colorSum = 0;
        const step = 4 * 10; // sample every 10 pixels for performance
        let count = 0;
        for (let i = 0; i < data.length; i += step) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = getLuminance(r, g, b);
          colorSum += lum;
          count++;
        }
        const avgLum = colorSum / count;
        // If luminance is less than 0.5, treat as dark background
        resolve(avgLum < 0.5);
      } catch (e) {
        // Cross-origin issue or error - fallback dark
        resolve(true);
      }
    };
    img.onerror = () => {
      resolve(true);
    };
  });
}

export default function HomePage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [data, setData] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isDarkBg, setIsDarkBg] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lon: number; city?: string; country?: string } | null>(null);
  const [astronomy, setAstronomy] = useState<AstronomyData | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const { data: session, status } = useSession();
  const [geminiEvents, setGeminiEvents] = useState<GeminiEvent[] | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<GeminiChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setSelectedDate(new Date());
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          // Reverse geocode to get city/country
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const data = await res.json();
            setLocation({
              lat,
              lon,
              city: data.address?.city || data.address?.town || data.address?.village || data.address?.state,
              country: data.address?.country,
            });
          } catch {
            setLocation({ lat, lon });
          }
        },
        (err) => setLocError('Location permission denied or unavailable')
      );
    } else {
      setLocError('Geolocation not supported');
    }
  }, []);

  useEffect(() => {
    if (!location || !selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    // Open-Meteo API for sunrise, sunset, moon phase
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&daily=sunrise,sunset,moon_phase&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`
    )
      .then((res) => res.json())
      .then((data) => {
        setAstronomy({
          sunrise: data.daily.sunrise?.[0]?.split('T')[1] || 'N/A',
          sunset: data.daily.sunset?.[0]?.split('T')[1] || 'N/A',
          moon_phase: data.daily.moon_phase?.[0]?.toFixed(2) || 'N/A',
        });
      })
      .catch(() => setAstronomy(null));
  }, [location, selectedDate]);

  // Splash screen effect
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;
    if (!apiKey) {
      setError('NASA API key is missing. Please set NEXT_PUBLIC_NASA_API_KEY in your .env.local file.');
      return;
    }
    const fetchApod = async (date: Date) => {
      try {
        setLoading(true);
        setError(null);
        const formattedDate = date.toISOString().split('T')[0];
        const res = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${formattedDate}`
        );
        if (!res.ok) throw new Error('Failed to fetch APOD data. Check your API key and network connection.');
        const apod = await res.json();
        setData(apod);
        // Analyze image brightness
        if (apod.url?.endsWith('.jpg') || apod.url?.endsWith('.png')) {
          const dark = await isImageDarkFromUrl(apod.url);
          setIsDarkBg(dark);
        } else {
          setIsDarkBg(true); // default dark bg for non-image URLs
        }
        setShowDetails(true);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchApod(selectedDate);
  }, [selectedDate]);

  // Fetch Gemini events when location is available
  useEffect(() => {
    if (!location) return;
    setGeminiLoading(true);
    setGeminiError(null);
    fetch(`/api/gemini-events?lat=${location.lat}&lon=${location.lon}`)
      .then(res => res.json())
      .then(data => {
        setGeminiEvents(data.events || []);
        setGeminiLoading(false);
      })
      .catch(err => {
        setGeminiError('Failed to fetch Gemini events.');
        setGeminiLoading(false);
      });
  }, [location]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleDateSelect = (value: Date | Date[] | null) => {
    const date = value instanceof Date ? value : Array.isArray(value) && value[0] instanceof Date ? value[0] : null;
    if (date) {
      setSelectedDate(date);
      setShowDetails(false);
    }
  };

  const textColorClass = isDarkBg ? 'text-white' : 'text-black';
  const overlayColor = isDarkBg ? 'bg-black/70' : 'bg-white/70';

  const sendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !location) return;
    setChatLoading(true);
    setChatError(null);
    const userMsg = { role: 'user' as const, content: chatInput };
    setChatHistory((h) => [...h, userMsg]);
    setChatInput('');
    try {
      const res = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg.content,
          lat: location.lat,
          lon: location.lon,
          events: geminiEvents?.filter(e => e.type === 'historical') || [],
        }),
      });
      const data = await res.json();
      if (data.error) setChatError(data.error);
      if (data.reply) setChatHistory((h) => [...h, { role: 'assistant', content: data.reply }]);
    } catch {
      setChatError('Failed to get response from Gemini.');
    } finally {
      setChatLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-widest animate-pulse">SPACE CALENDAR</h1>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <span className="text-white text-2xl">Loading...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <h2 className="text-4xl font-bold mb-6 text-white">Sign in to continue</h2>
        <button
          onClick={() => signIn('google')}
          className="px-6 py-3 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold shadow-lg"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!hasMounted) return null;

  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-center transition-all duration-500"
      style={
        data?.url?.endsWith('.jpg') || data?.url?.endsWith('.png')
          ? { backgroundImage: `url(${data.url})` }
          : { backgroundColor: 'black' }
      }
    >
      <main className={`flex-grow flex flex-col justify-center items-center p-6 sm:p-10 ${textColorClass}`}>
        <div className={`w-full max-w-4xl p-6 rounded-lg shadow-xl ${overlayColor} backdrop-blur-md`}>
          {/* Location and Astronomy Info */}
          <div className="mb-4 text-center">
            {location ? (
              <div>
                <span className="font-semibold">Your Location:</span>{' '}
                {location.city ? `${location.city}, ` : ''}{location.country || ''}
                <br />
                <span className="font-semibold">Lat/Lon:</span> {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
              </div>
            ) : locError ? (
              <span className="text-red-500">{locError}</span>
            ) : (
              <span>Detecting location...</span>
            )}
            {astronomy && (
              <div className="mt-2">
                <span className="font-semibold">Sunrise:</span> {astronomy.sunrise} &nbsp;
                <span className="font-semibold">Sunset:</span> {astronomy.sunset} &nbsp;
                <span className="font-semibold">Moon Phase:</span> {astronomy.moon_phase}
              </div>
            )}
          </div>
          <AnimatePresence mode="wait">
            {!showDetails && (
              <motion.section
                key="calendar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h2 className="text-4xl font-bold mb-6">Pick a Date</h2>
                <Calendar
                  onChange={handleDateSelect as (value: any) => void}
                  value={selectedDate || new Date()}
                  className="react-calendar"
                />
              </motion.section>
            )}

            {showDetails && data && (
              <motion.section
                key="event"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mx-auto mb-4 max-w-2xl bg-black/60 rounded-lg p-6 shadow-lg">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">{data.title}</h1>
                  <p className="text-center mb-4">{data.date}</p>
                </div>
                {data.url?.endsWith('.jpg') || data.url?.endsWith('.png') ? (
                  <img
                    src={data.url}
                    alt={data.title}
                    className="w-full max-h-[400px] object-cover rounded mb-4"
                  />
                ) : null}
                <p className="mb-6 text-justify">{data.explanation}</p>
                <div className="text-center">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Back to Calendar
                  </button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-center mt-4"
            >
              {error}
            </motion.p>
          )}
        </div>
      </main>
      {session && (
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div className="bg-gray-900/90 rounded-2xl p-8 shadow-2xl text-white border border-gray-800">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="material-icons text-indigo-400">event</span>
              Location-Specific Astronomical Events
            </h2>
            {geminiLoading && <p>Loading events...</p>}
            {geminiError && <p className="text-red-400">{geminiError}</p>}
            {geminiEvents && geminiEvents.length > 0 ? (
              <div>
                <h3 className="font-semibold mb-2 text-indigo-300">Upcoming Events</h3>
                <ul className="mb-4 pl-4 list-disc">
                  {geminiEvents.filter(e => e.type === 'upcoming').map((event, idx) => (
                    <li key={idx} className="mb-2">
                      <span className="font-bold text-indigo-200">{event.title}</span> <span className="text-gray-300">({event.date})</span>: {event.description}
                    </li>
                  ))}
                </ul>
                <h3 className="font-semibold mb-2 text-indigo-300">Historical Events</h3>
                <ul className="pl-4 list-disc">
                  {geminiEvents.filter(e => e.type === 'historical').map((event, idx) => (
                    <li key={idx} className="mb-2">
                      <span className="font-bold text-indigo-200">{event.title}</span> <span className="text-gray-300">({event.date})</span>: {event.description}
                    </li>
                  ))}
                </ul>
              </div>
            ) : !geminiLoading && <p>No events found for your location.</p>}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowChat(true)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200"
              >
                <span className="material-icons align-middle mr-2">chat</span>
                Chat with Gemini
              </button>
            </div>
          </div>
          {/* Gemini Chat Modal */}
          {showChat && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative border-2 border-indigo-700 animate-fadeIn">
                <button
                  onClick={() => setShowChat(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold"
                  aria-label="Close chat"
                >
                  ×
                </button>
                <h2 className="text-xl font-bold mb-4 text-indigo-300 flex items-center gap-2">
                  <span className="material-icons">smart_toy</span>
                  Gemini Chat
                </h2>
                <div ref={chatBoxRef} className="h-64 overflow-y-auto bg-black/30 rounded p-3 mb-4 border border-gray-700">
                  {chatHistory.length === 0 && <div className="text-gray-400">Ask about historical astronomical events for your location...</div>}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
                      <span className={msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-700'} style={{ display: 'inline-block', borderRadius: 8, padding: '6px 12px', margin: '4px 0', color: 'white' }}>{msg.content}</span>
                    </div>
                  ))}
                  {chatLoading && <div className="text-indigo-300">Gemini is typing...</div>}
                </div>
                {chatError && <div className="text-red-400 mb-2">{chatError}</div>}
                <form onSubmit={sendChat} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded px-3 py-2 text-black"
                    placeholder="Ask about a historical event..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    disabled={chatLoading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    disabled={chatLoading || !chatInput.trim()}
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
