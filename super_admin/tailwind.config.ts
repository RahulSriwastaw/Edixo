import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
	darkMode: "class",
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--bg-body)',
				foreground: 'var(--text-primary)',
				card: {
					DEFAULT: 'var(--bg-card)',
					foreground: 'var(--text-primary)'
				},
				popover: {
					DEFAULT: 'var(--bg-card)',
					foreground: 'var(--text-primary)'
				},
				primary: {
					DEFAULT: '#FF6B2B',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: 'var(--bg-card)',
					foreground: 'var(--text-primary)'
				},
				muted: {
					DEFAULT: 'var(--bg-card)',
					foreground: 'var(--text-secondary)'
				},
				accent: {
					DEFAULT: '#FF6B2B',
					foreground: '#FFFFFF'
				},
				destructive: {
					DEFAULT: '#F44336',
					foreground: '#FFFFFF'
				},
				border: 'var(--border-card)',
				input: 'var(--border-input)',
				ring: '#FF6B2B',
				chart: {
					'1': '#FF6B2B',
					'2': '#4CAF50',
					'3': '#2196F3',
					'4': '#9C27B0',
					'5': '#FFC107'
				}
			},
			borderRadius: {
				lg: '8px',
				md: '6px',
				sm: '4px'
			}
		}
	},
	plugins: [tailwindcssAnimate],
};
export default config;
