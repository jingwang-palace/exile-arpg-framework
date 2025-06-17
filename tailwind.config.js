/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'var(--color-primary)',
        'primary-hover': 'var(--color-primary-hover)',
        'primary-accent': 'var(--color-primary)',
        'page': 'var(--bg-primary)',
        'card': 'var(--bg-secondary)',
        'input': 'var(--bg-tertiary)',
        'disabled': 'var(--bg-tertiary)',
        'border': {
          'primary': 'var(--border-primary)',
          'secondary': 'var(--border-secondary)',
        },
        'text': {
          'primary': 'var(--text-primary)',
          'secondary': 'var(--text-secondary)',
          'tertiary': 'var(--text-tertiary)',
        },
        'background': {
          'primary': 'var(--bg-primary)',
          'secondary': 'var(--bg-secondary)',
          'tertiary': 'var(--bg-tertiary)'
        }
      },
    },
  },
  plugins: [],
} 