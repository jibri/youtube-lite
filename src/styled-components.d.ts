// import original module declarations
import "styled-components";

// and extend them!
declare module "styled-components" {
  export interface DefaultTheme {
    // Theme
    white: string;
    black: string;
    active: string;
    primary: string;
    secondary: string;
    background: string;
    notification: {
      background: string;
    };
    text: {
      light: string;
      main: string;
    };
    zIndex: {
      player: number;
      header: nulber;
      popup: number;
      loader: number;
    };
    video: {
      height: string;
    };
    // Misc
    headerHeigth: string;
    playerHeight: string;
  }
}
/*
declare module "styled-components/native" {
  export interface DefaultTheme {
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
    zIndex: {
      player: number;
      header: nulber;
      popup: number;
      loader: number;
    };
    video: {
      height: string;
    };
    // Misc
    headerHeigth: string;
    playerHeight: string;
  }
}
*/
