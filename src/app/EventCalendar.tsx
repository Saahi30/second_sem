// src/components/EventCalendar.tsx
'use client';

import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';  // import the calendar styles

export default function EventCalendar() {
  const [date, setDate] = useState(new Date());

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-900 rounded-lg shadow-lg text-white">
      <Calendar
        onChange={setDate}
        value={date}
        tileContent={({ date, view }) => {
          // You can add event indicators here later
          return null;
        }}
        className="react-calendar"
      />
      <p className="mt-4 text-center">
        Selected date: {date.toDateString()}
      </p>
    </div>
  );
}
