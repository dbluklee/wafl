/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pretendard': ['Pretendard', 'sans-serif'],
      },
      colors: {
        'bg-black': '#000000',
        'basic-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
}