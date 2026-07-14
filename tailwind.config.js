/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F5F1E7",
        surface: "#FFFFFF",
        ink: "#1B231E",
        inkSoft: "#5C665F",
        pine: "#2C4A3B",
        pineDark: "#1E362A",
        pineLight: "#3E6552",
        amber: "#DDA23C",
        amberDark: "#B07E22",
        terracotta: "#BD5A3A",
        line: "#DED6C0",
        sage: "#B9C4AE",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
