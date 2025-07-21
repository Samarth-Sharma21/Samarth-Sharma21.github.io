/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        clash: [
          'Space Grotesk',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        inter: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        primary: {
          light: '#0563bb',
          dark: '#0563bb',
        },
        background: {
          light: '#ffffff',
          dark: '#141e30',
        },
        text: {
          light: '#1A1A1A',
          dark: '#E6F1FF',
        },
        secondary: {
          light: '#4a5568',
          dark: '#B0B0B0',
        },
        accent: {
          light: '#3182ce',
          dark: '#D32F2F',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulse: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
