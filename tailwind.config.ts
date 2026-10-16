import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        editorial: ["var(--font-manrope)", "Manrope", "sans-serif"],
        serif: ["var(--font-manrope)", "Manrope", "sans-serif"],
      },
      maxWidth: {
        prose: "65ch",
      },
    },
  },
  plugins: [],
} satisfies Config;
