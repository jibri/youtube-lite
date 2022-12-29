import { DefaultTheme } from "styled-components";

export const defaultTheme: DefaultTheme = {
  // Theme
  white: "#ffffff",
  black: "#333333",
  active: "#3388ff",
  primary: "#ffffff",
  secondary: "#ffffff",
  background: "#ffffff",
  notification: {
    background: "#aaaaaa",
  },
  text: {
    light: "#666666",
    main: "#333333",
  },
  zIndex: {
    player: 1000,
    header: 3000,
    popup: 9000,
    loader: 9999,
  },
  video: {
    height: "90px",
  },
  // Misc
  headerHeigth: "3em",
  playerHeight: "270px",
};
export const darkTheme: DefaultTheme = {
  ...defaultTheme,

  // Theme
  white: "#ffffff",
  black: "#333333",
  active: "#ff55ff",
  primary: "#222222",
  secondary: "#333333",
  background: "#222222",
  notification: {
    background: "#333333",
  },
  text: {
    light: "#ffffff",
    main: "#dddddd",
  },
};
