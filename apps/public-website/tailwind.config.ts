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
          DEFAULT: '#FF5A1F', // Professional SaaS Orange
          hover: '#E84E18',
          light: '#FFF7ED',
        },
        secondary: {
          DEFAULT: '#F97316',
        },
        background: '#F9FAFB',
        card: '#FFFFFF',
        muted: '#6B7280',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '10px',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
