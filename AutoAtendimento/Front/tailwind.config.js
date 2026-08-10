/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#7C2D12',
          hover:   '#9A3412',
          light:   '#FFF7ED',
        },
      },
    },
  },
  plugins: [],
}

