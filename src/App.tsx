import React from "react";
import { BrowserRouter } from "react-router-dom";
import LoginProvider from "src/data/context/loginProvider";
import ConfigProvider from "src/data/context/configProvider";
import MyThemeProvider from "./data/context/ThemeProvider";
import Home from "./gui/modules/home/home";

const App = () => (
    <BrowserRouter>
        <LoginProvider>
          <ConfigProvider>
            <MyThemeProvider>
              <Home />
            </MyThemeProvider>
          </ConfigProvider>
        </LoginProvider>
    </BrowserRouter>
  );

export default App;
