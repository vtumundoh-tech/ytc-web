/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        beli: { DEFAULT: "#059669", dark: "#047857", light: "#ecfdf5" },
        cb: { DEFAULT: "#673ab7", dark: "#5e35b1", light: "#f3f0ff" },
      },
    },
  },
  plugins: [],
};
