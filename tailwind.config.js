/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mobile-first responsive design
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      // Game-specific utilities
      fontFamily: {
        'game': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'game': {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
          dark: '#1f2937',
          light: '#f9fafb',
        }
      }
    },
  },
  plugins: [],
}

