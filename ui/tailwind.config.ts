import type { Config } from "tailwindcss";

export default {
  // A casca não aplica reset nem tema; o design entra depois, via tokens.
  corePlugins: { preflight: false },
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
