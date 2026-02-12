/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
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
                // Keeping brand for backward compatibility if needed, but primary is preferred
                brand: {
                    primary: '#FF5A1F',
                    secondary: '#F97316',
                    hover: '#E84E18',
                    light: '#FFF7ED',
                }
            },
            borderRadius: {
                lg: '16px',
                md: '12px',
                sm: '10px',
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
