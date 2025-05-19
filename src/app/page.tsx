'use client';

import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion, AnimatePresence } from 'framer-motion';

interface ApodData {
  url: string;
  title: string;
  date: string;
  explanation: string;
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

interface ApodData {
  url: string;
  title: string;
  date: string;
  explanation: string;
}

export default function HomePage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [data, setData] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isDarkBg, setIsDarkBg] = useState(true);

  useEffect(() => {
    setHasMounted(true);
    setSelectedDate(new Date()); // set after mount to avoid SSR mismatch
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchApod = async (date: Date) => {
      try {
        setLoading(true);
        setError(null);
        const formattedDate = date.toISOString().split('T')[0];
        const res = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY}&date=${formattedDate}`
        );
        if (!res.ok) throw new Error('Failed to fetch APOD data');
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDetails(false);
  };

  const textColorClass = isDarkBg ? 'text-white' : 'text-black';
  const overlayColor = isDarkBg ? 'bg-black/70' : 'bg-white/70';

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
                  onChange={handleDateSelect}
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
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">{data.title}</h1>
                <p className="text-center mb-4">{data.date}</p>
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
    </div>
  );
}
