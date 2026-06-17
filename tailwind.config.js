/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        grave: "#0f1b2d",
        moss: "#1f5f46",
        broth: "#d9ead7",
        ember: "#57a773",
        beet: "#263b5e"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(31, 41, 51, 0.14)"
      }
    }
  },
  plugins: []
};
