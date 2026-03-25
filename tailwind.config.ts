import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecf6ff",
          100: "#d4e9ff",
          500: "#0c5fa8",
          700: "#08487f",
          900: "#062f52"
        }
      }
    }
  },
  plugins: []
};

export default config;
