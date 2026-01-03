/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rojo-intenso': '#C4161C',
        'naranja-calido': '#F28C28',
        'bordo-oscuro': '#2B0F10',
        'marron-oscuro': '#3A1F14',
        'negro-suave': '#121212',
      },
    },
  },
  plugins: [],
}