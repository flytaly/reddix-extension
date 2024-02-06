/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx,html}'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '576px',
      md: '960px',
      lg: '1440px',
    },
    extend: {
      colors: {
        'primary-50': 'rgb(var(--primary-50) / <alpha-value>)',
        'primary-100': 'rgb(var(--primary-100) / <alpha-value>)',
        'primary-200': 'rgb(var(--primary-200) / <alpha-value>)',
        'primary-300': 'rgb(var(--primary-300) / <alpha-value>)',
        'primary-400': 'rgb(var(--primary-400) / <alpha-value>)',
        'primary-500': 'rgb(var(--primary-500) / <alpha-value>)',
        'primary-600': 'rgb(var(--primary-600) / <alpha-value>)',
        'primary-700': 'rgb(var(--primary-700) / <alpha-value>)',
        'primary-800': 'rgb(var(--primary-800) / <alpha-value>)',
        'primary-900': 'rgb(var(--primary-900) / <alpha-value>)',
        'primary-950': 'rgb(var(--primary-950) / <alpha-value>)',
        'surface-0': 'rgb(var(--surface-0) / <alpha-value>)',
        'surface-50': 'rgb(var(--surface-50) / <alpha-value>)',
        'surface-100': 'rgb(var(--surface-100) / <alpha-value>)',
        'surface-200': 'rgb(var(--surface-200) / <alpha-value>)',
        'surface-300': 'rgb(var(--surface-300) / <alpha-value>)',
        'surface-400': 'rgb(var(--surface-400) / <alpha-value>)',
        'surface-500': 'rgb(var(--surface-500) / <alpha-value>)',
        'surface-600': 'rgb(var(--surface-600) / <alpha-value>)',
        'surface-700': 'rgb(var(--surface-700) / <alpha-value>)',
        'surface-800': 'rgb(var(--surface-800) / <alpha-value>)',
        'surface-900': 'rgb(var(--surface-900) / <alpha-value>)',
        'surface-950': 'rgb(var(--surface-950) / <alpha-value>)',

        light: 'rgb(var(--text-light) / <alpha-value>)',
        dark: 'rgb(var(--text-dark) / <alpha-value>)',

        'error-light': 'var(--error-light)',
        'error-dark': 'var(--error-dark)',
      },
    },
  },
  plugins: [],
}
