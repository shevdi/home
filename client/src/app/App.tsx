import { ThemeProvider } from 'styled-components'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { useAppSelector } from '@/store/hooks'
import { darkTheme, lightTheme, DarkGlobalStyle, LightGlobalStyle, GlobalStyle } from '@/styles'

function TP({ children }: React.PropsWithChildren) {
  const theme = useAppSelector((state) => state.config.theme)
  return (
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      <GlobalStyle />
      {theme === 'dark' ? <DarkGlobalStyle /> : <LightGlobalStyle />}
      {children}
    </ThemeProvider>
  )
}

function App({ children }: React.PropsWithChildren) {
  return (
    <Provider store={store}>
      <TP>{children}</TP>
    </Provider>
  )
}

export default App
