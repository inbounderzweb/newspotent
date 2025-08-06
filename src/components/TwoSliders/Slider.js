// src/components/Slider.jsx
import React, { useState, useEffect } from 'react';

export default function Slider({ slides, width = 'w-full', height = 'h-60' }) {
  const [current, setCurrent] = useState(0);

  // Auto-advance every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setCurrent(i => (i + 1) % slides.length);
    }, 3000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div className={`relative overflow-hidden ${width} ${height} rounded-xl`}>
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`
            absolute inset-0 flex items-center justify-center
            transition-opacity duration-700
            ${i === current ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ backgroundColor: slide.bg }}
        >
          <span className="text-4xl font-bold text-white">AD</span>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`
              text-xl leading-none focus:outline-none
              ${i === current ? 'text-white' : 'text-gray-700'}
            `}
          >
            •
          </button>
        ))}
      </div>
    </div>
  );
}
