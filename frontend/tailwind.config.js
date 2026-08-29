/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        casino: {
          dark: '#0a0a0f',
          darker: '#050508',
          red: '#d62828',
          gold: '#FFD700',
          rose: '#ff1493',
          purple: '#9d00ff',
          accent: '#ff006e',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow': '0 0 30px rgba(255, 20, 147, 0.3)',
        'glow-gold': '0 0 30px rgba(255, 215, 0, 0.3)',
        'glow-purple': '0 0 30px rgba(157, 0, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
