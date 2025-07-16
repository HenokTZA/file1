
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#D97706',   // Dark orange
        secondary: '#C2410C', // Slightly darker orange
      },
      keyframes: {
        enlarge: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
      },
      animation: {
        enlarge: 'enlarge 1.5s infinite',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
