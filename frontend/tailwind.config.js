/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        homestay: {
          50: "#fdf8f3",
          100: "#f8ead9",
          200: "#efd2ae",
          300: "#e2b378",
          400: "#d3924c",
          500: "#c37936",
          600: "#a5602c",
          700: "#824a26",
          800: "#6b3d24",
          900: "#5a3421",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
