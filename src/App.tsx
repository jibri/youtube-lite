import React from "react";
import { BrowserRouter } from "react-router-dom";
import LoginProvider from "src/data/context/loginProvider";
import MyThemeProvider from "./data/context/ThemeProvider";
import Home from "./gui/modules/home/home";

const App = () => (
  <BrowserRouter>
    <LoginProvider>
      <MyThemeProvider>
        <Home />
      </MyThemeProvider>
    </LoginProvider>
  </BrowserRouter>
);

export default App;
