const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        height: "height",
      },
      fontFamily: {
        sans: ["Rubik", ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        0.25: "0.0625rem",
        120: "30rem",
        160: "40rem",
        200: "50rem",
        240: "45rem",
      },
      fontSize: {
        heading1: "3.375rem",
        heading2: "2.75rem",
        heading3: "2.25rem",
        heading4: "1.5rem",
        subheading1: "1.25rem",
        subheading2: "1.125rem",
        body1: "1rem",
        body2: "0.875rem",
        body3: "0.75rem",
      },
    },
    colors: {
      transparent: {
        DEFAULT: "transparent",
      },
      white: {
        DEFAULT: "#fff",
      },
      black: {
        DEFAULT: "#000",
      },
      gray: {
        DEFAULT: "#A5A7A7",
        50: "#EBEBEB",
        100: "#E3E3E4",
        200: "#D3D4D4",
        300: "#C4C5C5",
        400: "#B4B6B6",
        500: "#A5A7A7",
        600: "#838686",
        700: "#636565",
        800: "#424343",
        900: "#212222",
      },
      teal: {
        DEFAULT: "#6BA8AE",
        50: "#E2EEEF",
        100: "#D4E6E8",
        200: "#BAD7D9",
        300: "#A0C7CB",
        400: "#85B8BC",
        500: "#6BA8AE",
        600: "#518F95",
        700: "#3F6F74",
        800: "#2D4F53",
        900: "#1B3032",
      },
      orange: {
        DEFAULT: "#FA6A2C",
        50: "#FEE8DF",
        100: "#FEDACB",
        200: "#FDBEA4",
        300: "#FCA27C",
        400: "#FB8654",
        500: "#FA6A2C",
        600: "#F24D06",
        700: "#C63F05",
        800: "#993104",
        900: "#6C2303",
      },
      yellow: {
        DEFAULT: "#F7D06F",
        50: "#FEFBF1",
        100: "#FDF6E3",
        200: "#FCECC6",
        300: "#FAE3A9",
        400: "#F9D98C",
        500: "#F7D06F",
        600: "#F5C244",
        700: "#F2B418",
        800: "#D1980C",
        900: "#A57809",
      },
    },
  },
};
