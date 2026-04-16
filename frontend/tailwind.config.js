/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1178D1',
        secondary: '#7BC144',
        accent: '#31B6DA',
        danger: '#EF4444',
      },
      boxShadow: {
        brand: '0 18px 45px rgba(17, 120, 209, 0.16)',
      },
    },
  },
  plugins: [],
}
