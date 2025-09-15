// src/components/HeroBanner.jsx
import React, { useState } from 'react';
import desktopHero from '../../../assets/hero-desktop.svg';
import mobileHero from '../../../assets/hero-mobile.svg';
import YouTube from 'react-youtube';

const HOTSPOTS_MOBILE = [
  { id: 'news-1', top: '5.5%', left: '18%', width: '18%', height: '15%', videoId: '1bH_ukYn81c' },
  { id: 'news-2', top: '7%', left: '42%', width: '30%', height: '14%', videoId: 'IFlXeFwA_2A' },
];

const HOTSPOTS_DESKTOP = [
  { id: 'news-1', top: '33.5%', left: '6.5%', width: '7.5%', height: '22%', videoId: '1bH_ukYn81c' },
  { id: 'news-2', top: '37.5%', left: '16%', width: '13%', height: '18%', videoId: 'IFlXeFwA_2A' },
];

const VIDEO_AREA_MOBILE = {
  top: '25%',
  left: '5%',
  width: '90%',
  height: '35%',
};

const VIDEO_AREA_DESKTOP = {
  top: '16%',
  left: '36%',
  width: '40%',
  height: '45%',
};

const VIDEO_CONTROLLERS = [
  { id: 'adds', text: 'Adds', videoId: 'IFlXeFwA_2A' },
  { id: 'reels', text: 'Reels', videoId: '1bH_ukYn81c' },
  { id: 'thenewspotenttv', text: 'The Newspotent TV', videoId: '1bH_ukYn81c' },
];

const Tooltip = ({ text, children }) => (
  <div className="relative flex items-center group">
    {children}
    <span className="
      absolute bottom-full mb-2 
      hidden group-hover:block 
      whitespace-nowrap
      bg-black text-white text-xs 
      rounded py-1 px-2 cursor-pointer
    ">
      {text}
    </span>
  </div>
);

const initialVideoId = VIDEO_CONTROLLERS[0].videoId;
const initialMessage = `Playing ${VIDEO_CONTROLLERS[0].text}...`;

export default function HeroBanner() {
  const [currentVideoId, setCurrentVideoId] = useState(initialVideoId);
  const [message, setMessage] = useState(initialMessage);
  const [isLoading, setIsLoading] = useState(true);
  const [playerKey, setPlayerKey] = useState(0); // New state for forcing a reload

  const handleClick = (videoId) => () => {
    setCurrentVideoId(videoId);
    setMessage(`Loading Newspotent Video...`);
    setIsLoading(true);
    setPlayerKey(prevKey => prevKey + 1); // Increment key to force reload
  };

  const handleControllerClick = (videoId, text) => () => {
    setCurrentVideoId(videoId);
    setMessage(`Playing ${text}...`);
    setIsLoading(true);
    setPlayerKey(prevKey => prevKey + 1); // Increment key to force reload
  };

  const videoOptions = {
    playerVars: {
      autoplay: 1,
      controls: 0,
      mute: 1,
      loop: 1,
      playlist: currentVideoId,
      rel: 0,
    },
  };

  const onPlayerStateChange = (event) => {
    // Player state 1 is 'PLAYING'
    if (event.data === 1) {
      setIsLoading(false);
      setMessage(null);
    }
  };

  return (
    <>
      {/* MOBILE */}
      <div className="relative w-full block sm:hidden">
        <img src={mobileHero} alt="Mobile Hero" className="w-full h-auto block" />
        {HOTSPOTS_MOBILE.map(hs => (
          <button
            key={hs.id}
            onClick={handleClick(hs.videoId)}
            className="
              absolute 
              bg-transparent 
              hover:bg-white hover:bg-opacity-20
              transition-colors duration-200 
              focus:outline-none
            "
            style={{
              top: hs.top,
              left: hs.left,
              width: hs.width,
              height: hs.height,
            }}
          />
        ))}

        <div
          className="absolute"
          style={{
            top: VIDEO_AREA_MOBILE.top,
            left: VIDEO_AREA_MOBILE.left,
            width: VIDEO_AREA_MOBILE.width,
            height: VIDEO_AREA_MOBILE.height,
          }}
        >
          <div className="
              tv-frame 
              w-full h-full 
              border-[5px] border-black 
              shadow-[25px_4px_10px_rgba(0,0,0,0.5)]
            ">
            {isLoading && message && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white text-xl p-4 z-10">
                {message}
              </div>
            )}
            <YouTube
              key={playerKey} // Apply the unique key here
              videoId={currentVideoId}
              opts={videoOptions}
              className="w-full h-full rounded-sm"
              iframeClassName="w-full h-full object-cover"
              onStateChange={onPlayerStateChange}
            />
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="relative w-full hidden sm:block">
        <img src={desktopHero} alt="Desktop Hero" className="w-full h-auto block" />
        {HOTSPOTS_DESKTOP.map(hs => (
          <button
            key={hs.id}
            onClick={handleClick(hs.videoId)}
            className="
              absolute 
              bg-transparent 
              hover:bg-white hover:bg-opacity-20 
              transition-colors duration-200 
              focus:outline-none
            "
            style={{
              top: hs.top,
              left: hs.left,
              width: hs.width,
              height: hs.height,
            }}
          />
        ))}

        <div
          className="absolute"
          style={{
            top: VIDEO_AREA_DESKTOP.top,
            left: VIDEO_AREA_DESKTOP.left,
            width: VIDEO_AREA_DESKTOP.width,
            height: VIDEO_AREA_DESKTOP.height,
          }}
        >
          <div className="
              tv-frame 
              w-full h-full 
              bg-gradient-to-r from-gray-900 to-gray-900 
              pb-[18px] rounded-sm px-[8px] pt-[8px] 
              shadow-[20px_15px_12px_rgba(0,0,0,0.5)]
            ">
            {isLoading && message && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white text-xl p-4 z-10">
                {message}
              </div>
            )}
            <YouTube
              key={playerKey} // Apply the unique key here
              videoId={currentVideoId}
              opts={videoOptions}
              className="w-full h-full rounded-sm"
              iframeClassName="w-full h-full object-cover"
              onStateChange={onPlayerStateChange}
            />
            
            <div className='flex gap-2 items-center mt-[6px] justify-end'>
              {VIDEO_CONTROLLERS.map(ctrl => (
                <Tooltip key={ctrl.id} text={ctrl.text}>
                  <button onClick={handleControllerClick(ctrl.videoId, ctrl.text)}>
                    <div className="w-6 h-1 rounded-full bg-white cursor-pointer"></div>
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}