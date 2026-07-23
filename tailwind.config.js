/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Lexend"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        indigo: {
          950: '#1e1b4b',
        },
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(30, 27, 75, 0.08), 0 1px 2px rgba(30,27,75,0.06)',
        softer: '0 8px 30px -8px rgba(30, 27, 75, 0.18)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pulse-ring': { '0%': { boxShadow: '0 0 0 0 rgba(220,38,38,0.4)' }, '100%': { boxShadow: '0 0 0 8px rgba(220,38,38,0)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out',
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
