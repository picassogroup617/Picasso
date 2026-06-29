import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          white: "#FFFFFF",
          gray: {
            50: "#FAFAFA",
            100: "#F4F4F5",
            200: "#E4E4E7",
            300: "#D4D4D8",
            500: "#71717A",
            550: "#62626A",
            650: "#494950",
            700: "#3F3F46",
            900: "#18181B",
          },
          yellow: {
            DEFAULT: "#FACC15",
            soft: "#FEF3C7",
            hover: "#EAB308",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
        elevated: "0 4px 12px 0 rgb(0 0 0 / 0.06)",
      },
      animation: {
        "scroll-x": "scroll-x 30s linear infinite",
        "blob-a": "blob-a 12s ease-in-out infinite",
        "blob-b": "blob-b 15s ease-in-out infinite",
        "blob-c": "blob-c 18s ease-in-out infinite",
        "float-slow": "float-slow 5s ease-in-out infinite",
        "float-slower": "float-slow 7s ease-in-out infinite",
        "drift-x": "drift-x 10s linear infinite",
      },
      keyframes: {
        "scroll-x": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "blob-a": {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(40px,-30px) scale(1.1)" },
          "66%": { transform: "translate(-30px,20px) scale(0.95)" },
        },
        "blob-b": {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(-50px,40px) scale(1.15)" },
        },
        "blob-c": {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "40%": { transform: "translate(30px,30px) scale(0.9)" },
          "80%": { transform: "translate(-20px,-40px) scale(1.05)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(-3deg)" },
          "50%": { transform: "translateY(-18px) rotate(3deg)" },
        },
        "drift-x": {
          "0%": { transform: "translateX(-10%)" },
          "100%": { transform: "translateX(110%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
