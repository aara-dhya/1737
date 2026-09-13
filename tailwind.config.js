/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        pastel: '#77DD77',
        pastelGreen: '#77DD77',
        mintDark: '#38A368',
        mutedGray: '#A0A0A0',
        darkSurface: '#0A0A0A',
        cardBg: '#050505',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        sm: '0px',
        DEFAULT: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
      boxShadow: {
        'brutal': '4px 4px 0px #77DD77',
        'brutal-sm': '2px 2px 0px #77DD77',
        'brutal-dark': '4px 4px 0px #38A368',
        'brutal-red': '4px 4px 0px #FF5555',
      }
    }
  },
  plugins: [],
}
