export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'],
  
  safelist: [
  'text-sage-700',
  'text-sage-300',
  'border-sage-300',
  'border-sage-700',
  'bg-sage-50',
  'bg-sage-100',
],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f2f5f0',
          100: '#e0e8da',
          200: '#c8d1c4',
          300: '#8ca989',
          400: '#7a9e77',
          500: '#6b8f68',
          600: '#5a7a5b',
          700: '#4a6b4b',
          900: '#4d6845',
        
        }
      }
    },
  },
  plugins: [],
}