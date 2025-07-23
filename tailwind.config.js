module.exports = {
  darkMode: "class", // or 'media'
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {},
  },
  plugins: [require("tailwind-scrollbar"), require("@tailwindcss/scrollbar")],
};
