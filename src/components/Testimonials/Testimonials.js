// src/components/Testimonials.jsx
import React, { useRef, useState } from 'react'
import Slider from 'react-slick'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import test1 from '../../assets/test1.svg'
import test2 from '../../assets/test2.svg'
import test3 from '../../assets/test3.svg'

// Slide data
const DEALS = [
  { id: 1, img: test1, name: 'Full Name', testimonial: 'Lorem ipsum dolor sit amet, ...' },
  { id: 2, img: test2, name: 'Full Name', testimonial: 'Lorem ipsum dolor sit amet, ...' },
  { id: 3, img: test3, name: 'Full Name', testimonial: 'Lorem ipsum dolor sit amet, ...' },
  { id: 4, img: test1, name: 'Full Name', testimonial: 'Lorem ipsum dolor sit amet, ...' },
]

export default function Testimonials() {
  const sliderRef = useRef(null)
  const [current, setCurrent] = useState(0)
  const slidesToShow = 3

  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 400,
    slidesToShow,
    slidesToScroll: 1,
    afterChange: idx => setCurrent(idx),
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 1 } },
    ],
  }

  const maxIndex = DEALS.length - slidesToShow

  return (
    <section className="bg-[#5A708E] text-white py-16 px-4">
      {/* Heading */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <h2 className="text-3xl font-medium">User testimonials</h2>
        <p className="mt-2 text-sm leading-relaxed">
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
        </p>
      </div>

      {/* Slider */}
      <div className="max-w-6xl mx-auto">
        <Slider ref={sliderRef} {...settings}>
          {DEALS.map(deal => (
            <div key={deal.id} className="px-3">
              <div className="bg-blue-100 text-blue-900 rounded-xl p-8 flex flex-col items-center h-full">
                <img src={deal.img} alt={deal.name} className="w-16 h-16 rounded-full mb-4" />
                <h3 className="text-lg font-semibold mb-2">{deal.name}</h3>
                <p className="text-center text-sm leading-relaxed">{deal.testimonial}</p>
              </div>
            </div>
          ))}
        </Slider>

        {/* Custom nav */}
        <div className="mt-6 flex items-center justify-center space-x-4 text-white">
          {/* Prev */}
          <button
            onClick={() => sliderRef.current.slickPrev()}
            disabled={current === 0}
            className="disabled:opacity-50"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="flex items-center space-x-2 text-xl">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <span
                key={i}
                className={`transition-colors ${
                  i === current ? 'text-white' : 'text-blue-300'
                }`}
                onClick={() => {
                  sliderRef.current.slickGoTo(i)
                }}
              >
                •
              </span>
            ))}
          </div>

          {/* Next */}
          <button
            onClick={() => sliderRef.current.slickNext()}
            disabled={current === maxIndex}
            className="disabled:opacity-50"
          >
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  )
}
