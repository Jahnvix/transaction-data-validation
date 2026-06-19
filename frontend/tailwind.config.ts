import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        slate: "#344256",
        mist: "#d9e3f0",
        surf: "#f6f8fb",
        accent: "#0f766e",
        glow: "#e8fff8",
      },
      boxShadow: {
        panel: "0 24px 60px rgba(8, 17, 31, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
