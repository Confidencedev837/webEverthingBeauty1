import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        accent: ['var(--font-accent)', 'monospace', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#32104D',
          interactive: '#6C35A6',
          accent: '#A78BCE',
          surface: '#F3EDF8',
          background: '#FDFBFF',
        },
      },
    },
  },
  plugins: [],
};

export default config;

