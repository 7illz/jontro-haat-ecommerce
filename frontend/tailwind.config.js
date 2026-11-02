/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        gray: {
          50:  '#fffaf0',
          100: '#f8eedf',
          200: '#eadcf2',
          300: '#cdb9da',
          400: '#aa91b9',
          500: '#816b91',
          600: '#604a70',
          700: '#402c50',
          800: '#291a35',
          900: '#180e22',
          950: '#09060d',
        },
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        accent: {
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
        },
        haunt: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#3b0764',
        },
        green: {
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        },
        emerald: {
          400: '#bef264',
          500: '#84cc16',
          600: '#4d7c0f',
        },
        blue: {
          400: '#c4b5fd',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        indigo: {
          400: '#c4b5fd',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        surface: {
          50:  'rgba(255, 255, 255, 0.03)',
          100: 'rgba(255, 255, 255, 0.05)',
          200: 'rgba(255, 255, 255, 0.08)',
          300: 'rgba(255, 255, 255, 0.12)',
          400: 'rgba(255, 255, 255, 0.16)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'bat-float': 'batFloat 8s ease-in-out infinite',
        'fog-drift': 'fogDrift 18s ease-in-out infinite alternate',
        'ember': 'ember 7s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.25)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        batFloat: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) rotate(-4deg)' },
          '50%': { transform: 'translate3d(14px, -12px, 0) rotate(5deg)' },
        },
        fogDrift: {
          '0%': { transform: 'translate3d(-4%, 0, 0) scale(1)' },
          '100%': { transform: 'translate3d(4%, -2%, 0) scale(1.08)' },
        },
        ember: {
          '0%, 100%': { opacity: '0.2', transform: 'translateY(8px)' },
          '50%': { opacity: '0.7', transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
