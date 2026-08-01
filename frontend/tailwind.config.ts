import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fbf7ee",
          100: "#f5ecd3",
          200: "#ecd8a6",
          300: "#e0bd71",
          400: "#d4a548",
          500: "#c4922f", // primary brand gold
          600: "#a97325",
          700: "#875621",
          800: "#6f4621",
          900: "#5c3b1f",
        },
        beige: {
          50: "#faf8f4",
          100: "#f5efe6",
          200: "#ece0cd",
          300: "#ddc9a8",
        },
        ink: {
          50: "#f7f7f8",
          100: "#eeeeef",
          200: "#d9d9db",
          300: "#b7b7bb",
          400: "#8f8f95",
          500: "#6b6b72",
          600: "#4d4d53",
          700: "#232326",
          800: "#18181a",
          900: "#0e0e0f",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        luxe: "0 10px 40px -12px rgba(0,0,0,0.25)",
        gold: "0 8px 30px -8px rgba(196,146,47,0.45)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #e0bd71 0%, #c4922f 45%, #875621 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-700px 0" }, "100%": { backgroundPosition: "700px 0" } },
      },
    },
  },
  plugins: [],
};

export default config;
