import { DefaultTheme } from "styled-components";

export const defaultTheme: DefaultTheme = {
  // Theme
  white: "#ffffff",
  black: "#333333",
  active: "#0050c8",
  primary: "#aad5ff",
  secondary: "#ddeeff",
  background: "#ffffff",
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
  primary: "#303030",
  secondary: "#444444",
  background: "#222222",
  text: {
    light: "#ffffff",
    main: "#dddddd",
  },
};
