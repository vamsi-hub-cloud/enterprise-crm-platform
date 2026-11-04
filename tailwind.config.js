/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'] },
      colors: {
        canvas: '#F3F5F8',
        ink: { 950: '#0A1621', 900: '#0F2233', 800: '#17324A', 700: '#244766', 600: '#3B6285' },
        brand: { 50: '#E8F7F4', 100: '#C9EEE7', 200: '#98DDD0', 300: '#5FC6B5', 400: '#2FAE9B', 500: '#16907F', 600: '#0F7569', 700: '#0E5E56' },
        coral: { 50: '#FEF0EC', 100: '#FDDDD3', 500: '#EF6C4D', 600: '#D9532F' },
        gold: { 50: '#FEF7E6', 100: '#FCEBBF', 400: '#F0B84B', 600: '#B7801A' },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,34,51,.05), 0 6px 20px -8px rgba(15,34,51,.10)',
        pop: '0 24px 60px -12px rgba(10,22,33,.35)',
      },
      keyframes: {
        pop: { from: { opacity: 0, transform: 'translateY(12px) scale(.98)' }, to: { opacity: 1, transform: 'none' } },
        fade: { from: { opacity: 0 }, to: { opacity: 1 } },
        slide: { from: { opacity: 0, transform: 'translateX(24px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { pop: 'pop .22s ease-out', fade: 'fade .18s ease-out', slide: 'slide .25s ease-out' },
    },
  },
  plugins: [],
};
