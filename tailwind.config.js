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
        green: {
          400: '#39FF14',
          500: '#00FF00',
          600: '#00CC00',
          800: '#005500',
          900: '#002200',
          950: '#001100',
        }
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', '"VT323"', 'monospace'],
        vga: ['"VT323"', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        DEFAULT: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        full: '0px',
      },
      boxShadow: {
        none: 'none',
      }
    }
  },
  plugins: [],
}
