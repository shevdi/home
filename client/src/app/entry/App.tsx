import { ThemeProvider } from 'styled-components'
import { Provider } from 'react-redux'
import { RootState, store } from '@/app/store/store'
import { useAppSelector } from '@/app/store/hooks'
import { darkTheme, lightTheme, DarkGlobalStyle, LightGlobalStyle, GlobalStyle } from '@/app/styles'

function TP({ children }: React.PropsWithChildren) {
  const theme = useAppSelector((state: RootState) => state.config.theme)
  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <GlobalStyle />
      {theme === 'dark' ? <DarkGlobalStyle /> : <LightGlobalStyle />}
      {children}
    </ThemeProvider>
  )
}

export function App({ children }: React.PropsWithChildren) {
  return (
    <Provider store={store}>
      <TP>{children}</TP>
    </Provider>
  )
}
