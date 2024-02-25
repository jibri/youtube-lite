// import original module declarations
import "styled-components";
import "@mui/material/styles";

// and extend them!
declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
declare module "@mui/material/styles" {
  interface Theme {
    // Theme
    white: string;
    black: string;
    active: string;
    primary: string;
    secondary: string;
    background: string;
    text: {
      light: string;
      main: string;
    };
    // zIndex: {
    //   player: number;
    //   header: nulber;
    //   popup: number;
    //   loader: number;
    // };
    video: {
      height: string;
    };
    // Misc
    headerHeigth: string;
    playerHeight: string;
    appMaxWidth: string;
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    // Theme
    white?: string;
    black?: string;
    active?: string;
    primary?: string;
    secondary?: string;
    background?: string;
    text?: {
      light: string;
      main: string;
    };
    // zIndex: ZIndexOptions & {
    //   player: number;
    //   header: nulber;
    //   popup: number;
    //   loader: number;
    // };
    video: {
      height: string;
    };
    // Misc
    headerHeigth: string;
    playerHeight: string;
    appMaxWidth: string;
  }
}
