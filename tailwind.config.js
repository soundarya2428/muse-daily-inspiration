/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens (switch with [data-theme])
        surface: 'rgb(var(--color-bg) / <alpha-value>)',
        raised: 'rgb(var(--color-bg-raised) / <alpha-value>)',
        sunken: 'rgb(var(--color-bg-sunken) / <alpha-value>)',
        outline: 'rgb(var(--color-border) / <alpha-value>)',
        primary: 'rgb(var(--color-text) / <alpha-value>)',
        'primary-soft': 'rgb(var(--color-text-soft) / <alpha-value>)',
        'primary-faint': 'rgb(var(--color-text-faint) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'on-accent': 'rgb(var(--color-accent-text) / <alpha-value>)',
        highlight: 'rgb(var(--color-highlight) / <alpha-value>)',
        blush: 'rgb(var(--color-rose) / <alpha-value>)',
        haze: 'rgb(var(--color-lavender) / <alpha-value>)',
        gilt: 'rgb(var(--color-gold) / <alpha-value>)',
        ivory: {
          50: '#FDFBF7',
          100: '#F8F4EC',
          200: '#F0E9DB',
          300: '#E4DAC6',
        },
        plum: {
          50: '#4A3752',
          600: '#35243D',
          700: '#2A1C31',
          800: '#201525',
          900: '#181020',
        },
        rose: {
          100: '#F3E3E3',
          200: '#E8C9C9',
          300: '#D9A5A5',
          400: '#C48787',
          500: '#AB6C6C',
        },
        lavender: {
          200: '#E3DAED',
          300: '#C9BBD8',
          400: '#AE9EC2',
          500: '#9382AB',
        },
        gold: {
          300: '#DCC494',
          400: '#C7A66A',
          500: '#B0924F',
          600: '#96793B',
        },
        charcoal: {
          DEFAULT: '#29262D',
          soft: '#3B3742',
          light: '#55505E',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        quote: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.2em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(41, 38, 45, 0.04), 0 8px 24px rgba(41, 38, 45, 0.06)',
        'card-lifted': '0 2px 4px rgba(41, 38, 45, 0.05), 0 16px 40px rgba(41, 38, 45, 0.10)',
      },
    },
  },
  plugins: [],
};

