/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: {
          100: 'var(--ifm-color-emphasis-900)',
          200: 'var(--ifm-color-emphasis-800)',
          300: 'var(--ifm-color-emphasis-700)',
          400: 'var(--ifm-color-emphasis-600)',
          500: 'var(--ifm-color-emphasis-500)',
          600: 'var(--ifm-color-emphasis-400)',
          700: 'var(--ifm-color-emphasis-300)',
          800: 'var(--ifm-footer-background-color)',
          900: 'var(--ifm-color-emphasis-100)',
        },
        rose: {
          500: '#f66a68',
        },
        yellow: {
          500: '#f5ad65',
        },
        cyan: {
          500: '#4fded9',
        },
        sky: {
          500: '#6ccfee',
        },
        purple: {
          400: '#d794e2',
          500: '#d066e2',
        }
      },
      fontFamily: {
        sans: 'var(--ifm-font-family-base)'
      },
      borderRadius: {
        DEFAULT: 'var(--global-radius)',
        sm: 'calc(var(--global-radius) * 0.5)',
        md: 'calc(var(--global-radius) * 0.67)',
        lg: 'var(--global-radius)',
        xl: 'calc(var(--global-radius) * 1.33)',
        '2xl': 'calc(var(--global-radius) * 1.5)',
        '3xl': 'calc(var(--global-radius) * 2)',
        full: '9999px',
        none: '0',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class',
}
