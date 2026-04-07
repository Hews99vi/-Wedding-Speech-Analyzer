/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(var(--bg))',
        surface: 'hsl(var(--surface))',
        surfaceAlt: 'hsl(var(--surface-alt))',
        border: 'hsl(var(--border))',
        text: 'hsl(var(--text))',
        muted: 'hsl(var(--muted))',
        brand: {
          50: 'hsl(var(--brand-50))',
          100: 'hsl(var(--brand-100))',
          200: 'hsl(var(--brand-200))',
          300: 'hsl(var(--brand-300))',
          400: 'hsl(var(--brand-400))',
          500: 'hsl(var(--brand-500))',
          600: 'hsl(var(--brand-600))',
          700: 'hsl(var(--brand-700))',
          800: 'hsl(var(--brand-800))'
        },
        danger: {
          50: 'hsl(var(--danger-50))',
          500: 'hsl(var(--danger-500))',
          700: 'hsl(var(--danger-700))'
        },
        success: {
          50: 'hsl(var(--success-50))',
          500: 'hsl(var(--success-500))',
          700: 'hsl(var(--success-700))'
        },
        warning: {
          50: 'hsl(var(--warning-50))',
          500: 'hsl(var(--warning-500))',
          700: 'hsl(var(--warning-700))'
        }
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'ui-serif', 'Georgia', 'serif']
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem'
      },
      boxShadow: {
        soft: '0 10px 30px -12px hsl(var(--brand-500) / 0.35)',
        card: '0 16px 40px -24px hsl(230 30% 15% / 0.4)'
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem'
      }
    }
  },
  plugins: []
}
