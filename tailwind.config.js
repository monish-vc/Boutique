/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf6f0',
          100: '#f9e8d9',
          200: '#f2ccb0',
          300: '#e8a97e',
          400: '#dc7f4a',
          500: '#d4622e',
          600: '#c54a23',
          700: '#a3371f',
          800: '#832e21',
          900: '#6b281e',
        },
        wine: {
          50: '#fdf2f5',
          100: '#fce7ed',
          200: '#fad0dc',
          300: '#f6a9c0',
          400: '#ef749b',
          500: '#e44d7a',
          600: '#d12b5d',
          700: '#b01d48',
          800: '#7c2d41',
          900: '#6f1a36',
          950: '#3f0a1c',
        },
        cream: {
          50: '#fffefb',
          100: '#fdf6f0',
          200: '#faebd7',
          300: '#f5dcc0',
          400: '#edc69e',
        },
        gold: {
          400: '#c9a84c',
          500: '#b8942e',
          600: '#a07d24',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
