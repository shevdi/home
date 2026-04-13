import { useEffect } from 'react'
import { Provider } from 'react-redux'
import type { RootState} from '@/app/store/store';
import { store } from '@/app/store/store'
import { useAppSelector } from '@/app/store/hooks'
import { DarkGlobalStyle, LightGlobalStyle } from '@/app/styles'
import { NetworkToastProvider } from '@/shared/pwa/NetworkToastProvider'

/** Theme = `html[data-theme]` + CSS variables (ui-kit tokens); no styled-components ThemeProvider. */
function TP({ children }: React.PropsWithChildren) {
  const theme = useAppSelector((state: RootState) => state.config.theme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light'
  }, [theme])
  return (
    <>
      {theme === 'dark' ? <DarkGlobalStyle /> : <LightGlobalStyle />}
      {children}
    </>
  )
}

export function App({ children }: React.PropsWithChildren) {
  return (
    <Provider store={store}>
      <TP>
        <NetworkToastProvider>{children}</NetworkToastProvider>
      </TP>
    </Provider>
  )
}
