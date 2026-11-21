/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        roseGold: {
          50: '#FDF7FA',
          100: '#FBEBF2',
          200: '#F7D6E4',
          300: '#EFB0CD',
          400: '#E8A0BF', // Primary Rose Gold
          500: '#D47FA6', // Soft Pink Accent
          600: '#B85B88',
          700: '#953E6B',
          800: '#7B3358',
          900: '#672D4A',
        },
        plum: {
          600: '#8A2B5E',
          700: '#6C224B', // Secondary Accent
          800: '#581845', // Deep Magenta / Plum Purple
          900: '#431234',
          950: '#2A0920',
        },
        gold: {
          300: '#F2D77C',
          400: '#E5C158', // Warm Gold
          500: '#D4AF37', // Metallic Gold
          600: '#B89324',
          700: '#937418',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FDFBF7', // Background Soft Cream
          200: '#FAF3E0', // Light Beige
          300: '#F4E9CD',
          400: '#E8D9B4',
        },
        charcoal: {
          800: '#3D3D3D',
          900: '#2C2C2C', // Dark Charcoal text
          950: '#1A1A1A',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Tajawal', 'sans-serif'],
        serif: ['Playfair Display', 'Amiri', 'serif'],
        arabic: ['Tajawal', 'Cairo', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -5px rgba(88, 24, 69, 0.08), 0 4px 6px -2px rgba(88, 24, 69, 0.04)',
        'luxury-hover': '0 20px 40px -10px rgba(88, 24, 69, 0.16), 0 8px 12px -3px rgba(212, 175, 55, 0.2)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.35)',
        'rose-glow': '0 0 25px rgba(232, 160, 191, 0.4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 2.5s infinite',
        pulseSlow: 'pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
