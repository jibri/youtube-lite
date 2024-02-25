import { ThemeOptions, createTheme } from "@mui/material";

const commons: ThemeOptions = {
  video: {
    height: "90px",
  },
  // Misc
  headerHeigth: "3em",
  playerHeight: "270px",
  appMaxWidth: "1000px",
};

const light: ThemeOptions = {
  palette: {
    mode: "light",
    secondary: {
      main: "#ddeeff",
      dark: "#aad5ff",
    },
  },
  ...commons,
};
export const dark: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#ff6189", // = active
    },
    secondary: {
      main: "#444444",
    },
    background: {
      default: "#222222",
    },
  },

  ...commons,
};
export const defaultTheme = createTheme(light);
export const darkTheme = createTheme(dark);
