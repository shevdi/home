export { ThemeProps } from './theme-types'
import darkThemeInitial from './theme-dark.json'
import lightThemeInitial from './theme-light.json'
import commonThemeInitial from './theme-common.json'
export { DarkGlobalStyle } from './global-dark'
export { LightGlobalStyle } from './global-light'
export { GlobalStyle } from './global-common'

export const darkTheme = {
  ...commonThemeInitial,
  darkThemeInitial
}

export const lightTheme = {
  ...commonThemeInitial,
  lightThemeInitial
}
