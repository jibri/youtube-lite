import React, { createContext, useState, useEffect, useContext } from 'react'
import { ThemeProvider } from 'styled-components'
import { defaultTheme, darkTheme } from 'src/utils/theme'

export const LIGHT_THEME = 'LT'
export const DARK_THEME = 'DT'
export const ThemeContext = createContext({ setThemeName: (n: string) => { } })

const MyThemeProvider = ({ children }: any) => {

  const [theme, setTheme] = useState(defaultTheme)
  const [themeName, setThemeName] = useState(DARK_THEME)

  useEffect(() => {
    if (themeName === LIGHT_THEME) setTheme(defaultTheme)
    if (themeName === DARK_THEME) setTheme(darkTheme)
  }, [themeName])

  return (
    <ThemeContext.Provider value={{ setThemeName }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  )
}
export default MyThemeProvider

export const useMyTheme = () => {
  const { setThemeName } = useContext(ThemeContext)
  return {
    dark: () => setThemeName(DARK_THEME),
    light: () => setThemeName(LIGHT_THEME)
  }
}
