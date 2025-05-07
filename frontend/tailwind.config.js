/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary : '#d32f2f',
        secondary:'#b12424'
      },
      container :{
        center: true,
        padding: {
          default: "1rem",
          sm: "3rem",
        }
      }
    },
  },
  plugins: [],
}

