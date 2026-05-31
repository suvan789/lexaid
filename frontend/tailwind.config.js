/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1a1f3a",
        accent: "#4f6ef7",
        "risk-high": "#ef4444",
        "risk-medium": "#f59e0b",
        "risk-low": "#22c55e",
        "bg-light": "#f8fafc",
        "card-bg": "#ffffff",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
