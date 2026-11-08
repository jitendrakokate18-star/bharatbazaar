/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'Mukta', 'sans-serif'],
      },
      colors: {
        bullish: {
          light: '#059669',
          DEFAULT: '#10b981',
          dark: '#34d399',
          bg: '#ecfdf5',
          darkBg: 'rgba(16, 185, 129, 0.12)',
        },
        bearish: {
          light: '#e11d48',
          DEFAULT: '#f43f5e',
          dark: '#fb7185',
          bg: '#fff1f2',
          darkBg: 'rgba(244, 63, 94, 0.12)',
        },
      },
    },
  },
  plugins: [],
};
