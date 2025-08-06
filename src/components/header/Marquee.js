import React from 'react'

export default function Marquee() {
  // 1. Define your different texts here
  const messages = [
    'offers and latest deals',
    'up to 50% off today',
    'new arrivals just in',
    'free shipping over $50',
    'subscribe & save more',
  ]

  // 2. How many times to repeat the full message set
  const repeats = 5

  // 3. Build one sequence: messages × repeats
  const sequence = Array.from({ length: repeats }).flatMap((_, blockIndex) =>
    messages.map((msg, i) => (
      <span key={`${blockIndex}-${i}`} className="inline-flex items-center pr-6 py-2 gap-5">
        <span className="w-2 h-2 bg-white rounded-full mr-2 flex-shrink-0" />
        <span className="whitespace-nowrap text-sm lowercase">
          {msg}
        </span>
      </span>
    ))
  )

  return (
    <div className="bg-black text-white overflow-hidden whitespace-nowrap">
      {/* 4. Two copies back-to-back */}
      <div className="flex animate-marquee">
        {sequence}
        {sequence}
      </div>
    </div>
  )
}
