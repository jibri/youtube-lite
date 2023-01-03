import React, { useContext } from "react";
import { ThemeProvider } from "styled-components";
import { darkTheme, defaultTheme } from "src/utils/theme";
import { ConfigContext } from "src/data/context/configProvider";

const MyThemeProvider = ({ children }: any) => {
  const { theme } = useContext(ConfigContext);

  return (
    <ThemeProvider theme={theme === "dark" ? darkTheme : defaultTheme}>{children}</ThemeProvider>
  );
};
export default MyThemeProvider;
