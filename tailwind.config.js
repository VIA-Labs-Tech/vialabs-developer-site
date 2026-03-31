/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: ['./src/**/*.{js,jsx,ts,tsx}', './docs/**/*.{md,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        via: {
          teal: '#00E5E5',
          dark: '#0F1117',
          surface: '#1a1b23',
          muted: '#94a3b8',
          border: 'rgba(100, 116, 139, 0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
