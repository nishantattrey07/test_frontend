/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#0f172a',
        'primary-start': '#1a1a2e',
        'primary-end': '#16213e',
        'primary-highlight': '#4b5e8a',
        'accent-start': '#00d4aa',
        'accent-end': '#01a3ff',
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0a0',
        'error': '#ff6b6b',
        'success': '#51cf66',
        'holographic-start': '#a5f3fc',
        'holographic-end': '#34d399',
      },
      fontFamily: {
        'custom': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        'shake': 'shake 0.6s ease-in-out',
        'spin-smooth': 'spin 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'waveform': 'waveform 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { 
            transform: 'translateY(30px)', 
            opacity: '0',
            scale: '0.95'
          },
          '100%': { 
            transform: 'translateY(0)', 
            opacity: '1',
            scale: '1'
          },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(1, 163, 255, 0.4), 0 0 40px rgba(0, 212, 170, 0.2)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};