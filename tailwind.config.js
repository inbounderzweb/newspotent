/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
       keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
       animation: {
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [
     require('@tailwindcss/aspect-ratio'),
  ],
}

