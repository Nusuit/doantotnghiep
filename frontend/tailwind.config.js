/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fef7ee',
                    100: '#fdeedd',
                    200: '#fad5ba',
                    300: '#f7b88d',
                    400: '#f2925e',
                    500: '#ef7441',
                    600: '#e15a27',
                    700: '#bc4621',
                    800: '#963a21',
                    900: '#78341e',
                    950: '#41190e',
                },
                secondary: {
                    50: '#f6f7f9',
                    100: '#eceff2',
                    200: '#d5dce3',
                    300: '#b1c1cc',
                    400: '#87a0b0',
                    500: '#678297',
                    600: '#536a7d',
                    700: '#435566',
                    800: '#3a4956',
                    900: '#333e49',
                    950: '#222831',
                },
                accent: {
                    50: '#fef3f2',
                    100: '#fee4e2',
                    200: '#fccfca',
                    300: '#f9aea6',
                    400: '#f47f72',
                    500: '#eb5545',
                    600: '#d73527',
                    700: '#b52819',
                    800: '#95251a',
                    900: '#7c251d',
                    950: '#430f0b',
                }
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(10px)'
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)'
                    },
                },
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
} 