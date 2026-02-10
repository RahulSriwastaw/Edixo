import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
            DEFAULT: '#2563EB',
            dark: '#1E40AF',
            light: '#60A5FA',
        },
        secondary: {
            DEFAULT: '#7C3AED',
        }
      }
    },
  },
  plugins: [],
};
export default config;
