import React from "react"
import { BrowserRouter } from 'react-router-dom'
import LoginProvider from 'src/data/context/loginProvider'
import Home from './gui/modules/home/home'


const App = () => (
  <BrowserRouter>
    <LoginProvider>
      <Home />
    </LoginProvider>
  </BrowserRouter>
)

export default App
