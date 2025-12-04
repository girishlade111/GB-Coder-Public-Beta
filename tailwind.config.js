/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'matte-black': '#0A0A0A',
        'bright-white': '#FFFFFF',
        'dark-gray': '#1A1A1A',
        'light-gray': '#E5E5E5',
      },
    },
  },
  plugins: [],
};
