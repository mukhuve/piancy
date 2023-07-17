/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        white: "#fffbeb",
        black: "#393e41",
        gold: {
          regular: "#ffd52e",
          light: "#EFE0A4",
          dark: "#D1A700",
        },
        green: "#4caf50",
        red: "#f44336",
      },
    },
    plugins: [],
  },
};
