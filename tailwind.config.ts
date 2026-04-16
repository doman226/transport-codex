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
          50: "#edf3ff",
          100: "#d9e5ff",
          300: "#96ace5",
          500: "#425fae",
          700: "#253783",
          900: "#10245f"
        },
        accent: {
          50: "#f8f2e8",
          100: "#e8dac0",
          500: "#8f6a35",
          700: "#66471f",
          900: "#3f2a12"
        },
        sand: {
          50: "#f8fbff",
          100: "#eef4ff",
          200: "#d8e5ff"
        }
      }
    }
  },
  plugins: []
};

export default config;
