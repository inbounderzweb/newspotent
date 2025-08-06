// src/components/HeroBanner.jsx
import React from 'react'
import desktopHero from '../../../assets/hero-desktop.svg'
import mobileHero  from '../../../assets/hero-mobile.svg'

const HOTSPOTS_MOBILE = [
  { id: 'news-1', top: '5.5%',  left: '18%', width: '18%', height: '15%' },
  { id: 'news-2', top: '7%',    left: '42%', width: '30%', height: '14%' },
]

const HOTSPOTS_DESKTOP = [
  { id: 'news-1', top: '33.5%', left: '6.5%',  width: '7.5%', height: '22%' },
  { id: 'news-2', top: '37.5%', left: '16%',   width: '13%',  height: '18%' },
]

const VIDEO_AREA_MOBILE = {
  top:    '25%',
  left:   '5%',
  width:  '90%',
  height: '35%',
}

const VIDEO_AREA_DESKTOP = {
  top:    '16%',
  left:   '36%',
  width:  '40%',
  height: '45%',
}

export default function HeroBanner() {
  const handleClick = id => () => alert(`youclicked ${id}`)

  return (
    <>
      {/* MOBILE */}
      <div className="relative w-full block sm:hidden">
        <img src={mobileHero} alt="Mobile Hero" className="w-full h-auto block" />

        {/* newspaper hotspots */}
        {HOTSPOTS_MOBILE.map(hs => (
          <button
            key={hs.id}
            onClick={handleClick(hs.id)}
            className="
              absolute 
              bg-transparent 
              hover:bg-white hover:bg-opacity-20
              transition-colors duration-200 
              focus:outline-none
            "
            style={{
              top:    hs.top,
              left:   hs.left,
              width:  hs.width,
              height: hs.height,
            }}
          />
        ))}

        {/* TV video on mobile */}
        <div
          className="absolute"
          style={{
            top:    VIDEO_AREA_MOBILE.top,
            left:   VIDEO_AREA_MOBILE.left,
            width:  VIDEO_AREA_MOBILE.width,
            height: VIDEO_AREA_MOBILE.height,
          }}
        >
          {/* Custom bezel + shine + drop shadow */}
          <div className="
              tv-frame 
              w-full h-full 
              border-[5px] border-black 
              shadow-[25px_4px_10px_rgba(0,0,0,0.5)]
            ">
            <video
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              autoPlay loop muted playsInline
              className="w-full h-full object-cover rounded-sm"
            />
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="relative w-full hidden sm:block">
        <img src={desktopHero} alt="Desktop Hero" className="w-full h-auto block" />

        {/* newspaper hotspots */}
        {HOTSPOTS_DESKTOP.map(hs => (
          <button
            key={hs.id}
            onClick={handleClick(hs.id)}
            className="
              absolute 
              bg-transparent 
              hover:bg-white hover:bg-opacity-20 
              transition-colors duration-200 
              focus:outline-none
            "
            style={{
              top:    hs.top,
              left:   hs.left,
              width:  hs.width,
              height: hs.height,
            }}
          />
        ))}

        {/* TV video on desktop */}
        <div
          className="absolute"
          style={{
            top:    VIDEO_AREA_DESKTOP.top,
            left:   VIDEO_AREA_DESKTOP.left,
            width:  VIDEO_AREA_DESKTOP.width,
            height: VIDEO_AREA_DESKTOP.height,
          }}
        >
          {/* Custom bezel + shine + drop shadow */}
          <div className="
              tv-frame 
              w-full h-full 
              bg-gradient-to-r from-gray-900 to-gray-900 
              pb-[15px] rounded-sm px-[8px] pt-[8px] 
              shadow-[20px_15px_12px_rgba(0,0,0,0.5)]
            ">
            <video
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              autoPlay loop muted playsInline
              className="w-full h-full object-cover rounded-sm"
            />
          </div>
        </div>
      </div>
    </>
  )
}
