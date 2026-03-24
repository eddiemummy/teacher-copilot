/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        teacher: {
          primary: "#06b6d4",
          soft: "#ecfeff",
        },
      },
    },
  },
  plugins: [],
};

