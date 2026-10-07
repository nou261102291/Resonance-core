/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/shared/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        resonance: {
          bg: "#0D1117",
          bgSecondary: "#161B22",
          border: "#30363D",
          accent: "#58A6FF",
          success: "#3FB950",
          warning: "#D29922",
          error: "#F85149",
          text: "#E6EDF3",
          textMuted: "#8B949E",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};