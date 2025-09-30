/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 10px 30px rgba(255, 182, 193, 0.35)',
      },
      backgroundImage: {
        stars:
          'radial-gradient(ellipse at top, rgba(255,255,255,0.18), transparent 60%), ' +
          'radial-gradient(ellipse at bottom, rgba(255,192,203,0.15), transparent 60%)',
      },
    },
  },
}
