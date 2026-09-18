/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          purpleDeep: '#B984DF',
          purpleSoft: '#C095E4',
          pinkLightest: '#FCEDF2',
          pinkLight: '#FFD1D4',
          pinkMid: '#FFB7C5',
          pinkVibrant: '#FFA0C5',
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
