import { BrowserRouter } from "react-router-dom";
import LoginProvider from "src/data/context/loginProvider";
import ConfigProvider from "src/data/context/configProvider";
import MyThemeProvider from "./data/context/ThemeProvider";
import Home from "./gui/modules/home/home";
import ErrorProvider from "src/data/context/errorProvider";
import { createGlobalStyle } from "styled-components";
import PlaylistsProvider from "src/data/context/playlistsProvider";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${(props) => props.theme.palette.background.default};
  }
`;

const App = () => (
  <BrowserRouter>
    <LoginProvider>
      <ConfigProvider>
        <ErrorProvider>
          <PlaylistsProvider>
            <MyThemeProvider>
              <GlobalStyle />
              <Home />
            </MyThemeProvider>
          </PlaylistsProvider>
        </ErrorProvider>
      </ConfigProvider>
    </LoginProvider>
  </BrowserRouter>
);

export default App;
