import React from "react";
import { BrowserRouter } from "react-router-dom";
import LoginProvider from "src/data/context/loginProvider";
import ConfigProvider from "src/data/context/configProvider";
import MyThemeProvider from "./data/context/ThemeProvider";
import Home from "./gui/modules/home/home";
import ErrorProvider from "src/data/context/errorProvider";

const App = () => (
  <BrowserRouter>
    <ErrorProvider>
      <LoginProvider>
        <ConfigProvider>
          <MyThemeProvider>
            <Home />
          </MyThemeProvider>
        </ConfigProvider>
      </LoginProvider>
    </ErrorProvider>
  </BrowserRouter>
);

export default App;
