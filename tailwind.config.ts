import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Aerodome", "sans-serif"],
        mono: ["Circuit Forem", "monospace"],
        aerodome: ["Aerodome", "sans-serif"],
        circuit: ["Circuit Forem", "monospace"],
        gear: ["GEAR 8", "sans-serif"],
        pixel: ["Pixelated Elegance", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default config;