import React from "react";

function Partners() {
  const logos = [
    "Logo", "Logo", "Logo", "Logo", "Logo", "Logo", "Logo", "Logo"
  ];

  return (
    <div className="bg-[#dcecf6] py-10 relative overflow-hidden">
      {/* Title */}
      <h2 className="text-center text-2xl font-semibold text-blue-700 mb-8">
        Our Partners
      </h2>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-[#dcecf6] to-transparent z-10"></div>
      <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-[#dcecf6] to-transparent z-10"></div>

      {/* Scrolling Logos */}
      <div className="flex gap-6 animate-scroll whitespace-nowrap">
        {logos.map((logo, index) => (
          <div
            key={index}
            className="min-w-[120px] h-20 bg-blue-700 text-white flex items-center justify-center rounded-lg"
          >
            {logo}
          </div>
        ))}
        {/* Duplicate logos for smooth infinite scroll */}
        {logos.map((logo, index) => (
          <div
            key={index + logos.length}
            className="min-w-[120px] h-20 bg-blue-700 text-white flex items-center justify-center rounded-lg"
          >
            {logo}
          </div>
        ))}
      </div>

      {/* Tailwind Custom Animation */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          display: flex;
          animation: scroll 15s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default Partners;
