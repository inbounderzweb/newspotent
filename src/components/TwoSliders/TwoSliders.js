// src/components/TwoSliders.jsx
import React from 'react';
import Slider from './Slider';

export default function TwoSliders() {
  const redSlides = [
    { bg: '#a83232' },
    { bg: '#b54444' },
    { bg: '#c85555' },
  ];

  const blueSlides = [
    { bg: '#364aa4' },
    { bg: '#4355b2' },
    { bg: '#5768c5' },
  ];

  return (
    <div className=" pt-8 flex flex-col lg:flex-row gap-6 items-center justify-center mx-auto w-[90%] md:w-[75%]">
      {/* Always visible on all screen sizes */}
      <div className="w-full">
        <Slider slides={redSlides} />
      </div>

      {/* Hidden on mobile; shown from sm: (≥640px) upwards */}
      <div className="hidden sm:block w-full">
        <Slider slides={blueSlides} />
      </div>
    </div>
  );
}
