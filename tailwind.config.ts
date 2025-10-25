import type { Config } from "tailwindcss"
// ⭐️ (1) استدعي "default export" كله
import defaultTheme from "tailwindcss/defaultTheme" 
import animatePlugin from "tailwindcss-animate" 

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // ⭐️ (2) استخدم الخاصية من الأوبجكت اللي استدعيناه
        sans: ["var(--font-cairo)", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [
    animatePlugin,
  ],
} satisfies Config

export default config