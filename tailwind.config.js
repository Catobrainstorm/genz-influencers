/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        smartan: {
          orange: '#f7961d',
          blue: '#0076c6',
          pink: '#ec297b',
          teal: '#1b9a72',
          gray: '#a3a6ab',
          navy: '#08263f',
          purple: '#90278e',
          red: '#db4d26',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}