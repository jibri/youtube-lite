import React, { createContext, useState, useContext } from "react";
import { DefaultTheme, ThemeProvider } from "styled-components";
import { defaultTheme, darkTheme } from "src/utils/theme";

export const LIGHT_THEME = "LT";
export const DARK_THEME = "DT";
export const ThemeContext = createContext((n: DefaultTheme) => {});

const MyThemeProvider = ({ children }: any) => {
  const [theme, setTheme] = useState(darkTheme);

  return (
    <ThemeContext.Provider value={setTheme}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
export default MyThemeProvider;

export const useMyTheme = () => {
  const setTheme = useContext(ThemeContext);
  return {
    dark: () => setTheme(darkTheme),
    light: () => setTheme(defaultTheme),
  };
};
