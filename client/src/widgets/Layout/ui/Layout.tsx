import styled from 'styled-components'
import { Header } from './Header'
import { Footer } from './Footer'
import { Outlet } from 'react-router'
import { useAppSelector, getPageError, getPending } from '@/app/store'
import { Error, Loader } from '@/shared/ui'

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const Main = styled.main`
  position: relative;
  width: 100%;
  flex-grow: 1;
  display: flex;
`

const PageContainer = styled.div`
  margin: 0 auto;
  padding: 1rem;
  max-width: 1024px;
  flex-grow: 1;
`

export function Layout() {
  const isPending = useAppSelector(getPending)
  const error = useAppSelector(getPageError)
  return (
    <LayoutContainer>
      <Header />
      <Main>
        {error ? (
          <Error title='Ошибка' message='Что-то пошло не так' />
        ) : isPending ? (
          <Loader />
        ) : (
          <PageContainer>
            <Outlet />
          </PageContainer>
        )}
      </Main>
      <Footer />
    </LayoutContainer>
  )
}
