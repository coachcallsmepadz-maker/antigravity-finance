/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'carbon': {
          900: '#121212',
          800: '#1a1a1a',
          700: '#242424',
          600: '#2d2d2d',
          500: '#363636',
        },
        'emerald-growth': '#10B981',
        'slate-outcome': '#475569',
        'plaid-blue': '#0067E1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'emerald-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'emerald-glow-strong': '0 0 30px rgba(16, 185, 129, 0.5)',
      },
      backdropBlur: {
        'glass': '8px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(16, 185, 129, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
