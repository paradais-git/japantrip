/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        japan: {
          red: '#BC002D',
          crimson: '#8B0000',
        },
      },
    },
  },
  plugins: [],
}
